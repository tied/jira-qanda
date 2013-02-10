/*
 * Created on 1/28/13
 */
package ro.agrade.jira.qanda.dao;

import java.util.*;

import com.atlassian.jira.security.JiraAuthenticationContext;
import org.ofbiz.core.entity.*;

import ro.agrade.jira.qanda.Question;
import ro.agrade.jira.qanda.QuestionStatus;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


/**
 * The data service
 *
 * @author Radu Dumitriu (rdumitriu@gmail.com)
 * @since 1.0
 */
public class QuestionDataServiceImpl extends BaseDaoService implements QuestionDataService {
    private static final Log LOG = LogFactory.getLog(QuestionDataServiceImpl.class);
    private final GenericDelegator delegator;

    /**
     * Constructor
     * @param authContext the authentication context we should inject into this
     */
    public QuestionDataServiceImpl(JiraAuthenticationContext authContext) {
        super(authContext);
        this.delegator = GenericDelegator.getGenericDelegator("default");
    }

    /**
     * Gets all undeleted questions
     * @param issueId the issue id
     * @return the list of questions
     */
    @Override
    public List<Question> getQuestionsForIssue(long issueId) {
        try {
            Map<String, Object> map = new HashMap<String, Object>();
            map.put(ISSUEID_FIELD, issueId);
            map.put(DELETED_FIELD, "N");
            List<GenericValue> list = delegator.findByAnd(ENTITY, map);
            List<Question> ret = fromGenericValue(list);
            return ret;
        } catch(GenericEntityException e) {
            String msg = String.format("Could not load issue (%d) questions ?!?", issueId);
            LOG.error(msg);
            throw new OfbizDataException(msg, e);
        }
    }

//    //::TODO:: panel
//    /**
//     * Gets all unresolved questions
//     *
//     * @param project the project
//     * @return the questions for the project which are not resolved, if any
//     */
//    @Override
//    public List<Question> getUnresolvedQuestionsForProject(String project) {
//        //::TODO:: we must fix this
//        try {
//            Map<String, Object> map = new HashMap<String, Object>();
//            map.put(STATUS_FIELD, translateStatusToCode(QuestionStatus.OPEN));
//            map.put(DELETED_FIELD, "N");
//            List<GenericValue> list = delegator.findByAnd(ENTITY, map);
//            List<Question> ret = fromGenericValue(list);
//            return ret;
//        } catch(GenericEntityException e) {
//            String msg = String.format("Could not load project (%s) questions ?!?", project);
//            LOG.error(msg);
//            throw new OfbizDataException(msg, e);
//        }
//    }

    /**
     * Gets a specific question by id
     *
     * @param questionId the id
     * @return the question if not deleted, null otherwise
     */
    @Override
    public Question getQuestion(long questionId) {
        try {
            Map<String, Object> map = new HashMap<String, Object>();
            map.put(ID_FIELD, questionId);
            map.put(DELETED_FIELD, "N");
            List<GenericValue> list = delegator.findByAnd(ENTITY, map);
            if(list == null || list.size() == 0) {
                return null;
            }
            return fromGenericValue(list.get(0));
        } catch(GenericEntityException e) {
            String msg = String.format("Could not load issue question (%d) ?!?", questionId);
            LOG.error(msg);
            throw new OfbizDataException(msg, e);
        }
    }

    @Override
    public void addQuestion(long issueId, String question) {
        try {
            Question q = new Question(delegator.getNextSeqId(ENTITY), issueId, question, getCurrentUser());
            delegator.create(toGenericValue(q));
        } catch(GenericEntityException e) {
            String msg = String.format("Could not create question  on issue %d ?!?", issueId);
            LOG.error(msg);
            throw new OfbizDataException(msg, e);
        }
    }

    @Override
    public void removeQuestion(long qid) {
        try {
            GenericValue v = delegator.findByPrimaryKey(makePk(qid));
            v.setString(DELETED_FIELD, "Y");
            delegator.store(v);
        } catch(GenericEntityException e) {
            String msg = String.format("Could not remove question %d ?!?", qid);
            LOG.error(msg);
            throw new OfbizDataException(msg, e);
        }
    }

    @Override
    public void setQuestionFlag(long qid, QuestionStatus status) {
        try {
            GenericValue v = delegator.findByPrimaryKey(makePk(qid));
            v.setString(STATUS_FIELD, translateStatusToCode(status));
            delegator.store(v);
        } catch(GenericEntityException e) {
            String msg = String.format("Could not update question %d ?!?", qid);
            LOG.error(msg);
            throw new OfbizDataException(msg, e);
        }
    }

    private GenericPK makePk(long qid) {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put(ID_FIELD, qid);
        return delegator.makePK(ENTITY, map);
    }

    private GenericValue toGenericValue(Question q) {
        Map<String, Object> map = new HashMap<String, Object>();
        map.put(ID_FIELD, q.getId());
        map.put(TEXT_FIELD, q.getQuestionText());
        map.put(ISSUEID_FIELD, q.getIssueId());
        map.put(TS_FIELD, q.getTimeStamp());
        map.put(USER_FIELD, q.getUser());
        map.put(STATUS_FIELD, translateStatusToCode(q.getStatus()));
        map.put(DELETED_FIELD, "N");
        return delegator.makeValue(ENTITY, map);
    }

//    private String extractProjectFromKey(String issueKey) {
//        StringBuilder sb = new StringBuilder();
//        for(int i = 0; i < issueKey.length(); i++) {
//            char c = issueKey.charAt(i);
//            if(c != '-') {
//                sb.append(c);
//            } else {
//                return sb.toString();
//            }
//        }
//        throw new OfbizDataException("Invalid issue key: " + issueKey);
//    }

    private Question fromGenericValue(GenericValue genval) {
        if(genval == null) {
            return null;
        }
        long id = (Long)genval.get(ID_FIELD);
        String questionText = (String)genval.get(TEXT_FIELD);
        long issueId = (Long)genval.get(ISSUEID_FIELD);
        long timeStamp = (Long)genval.get(TS_FIELD);
        String user = (String)genval.get(USER_FIELD);
        String statusCode = (String)genval.get(STATUS_FIELD);

        return new Question(id, issueId, questionText,
                            user, timeStamp,
                            translateStatusFromCode(statusCode), null);
    }

    private List<Question> fromGenericValue(List<GenericValue> l) {
        List<Question> result = new ArrayList<Question>();
        if(l == null) {
            return result;
        }
        for(GenericValue gv : l) {
            result.add(fromGenericValue(gv));
        }
        return result;
    }

    private QuestionStatus translateStatusFromCode(String s) {
        switch(s.charAt(0)) {
            case 'O':
            case 'o':
                return QuestionStatus.OPEN;
            case 'C':
            case 'c':
                return QuestionStatus.CLOSED;
        }
        throw new OfbizDataException("Bad mapping for status >>" + s + "<<");
    }

    private String translateStatusToCode(QuestionStatus status) {
        switch (status) {
            case OPEN:
                return "O";
            case CLOSED:
                return "C";
        }
        throw new OfbizDataException("Status is 'O' or 'C'");
    }

    private static final String ENTITY = "QANDAQ";
    private static final String ID_FIELD = "q_id";
    private static final String TEXT_FIELD = "q_text";
    private static final String ISSUEID_FIELD = "q_issueid";
    private static final String TS_FIELD = "q_creationts";
    private static final String USER_FIELD = "q_user";
    private static final String STATUS_FIELD = "q_status";
    private static final String DELETED_FIELD = "q_deleted";
}

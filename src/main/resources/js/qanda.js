
//::TODO:: better checks on texts
//
// Copyright (c) AGRADE Software. Please read src/main/resources/META-INF/LICENSE
// or online document at: https://github.com/rdumitriu/jira-qanda/wiki/LICENSE
//

var QANDA = (function () {

    function createAskPanelContent(issueKey, projectKey, qtext) {
        var html = '<form class="aui">';
            html += '<div class="field-group">';
                html += '<label for="qandaquestiontext">'+ AJS.params.qaskLabel +'</label>';
                html += '<textarea cols="50" rows="5" class="textarea long-field wiki-textfield qanda-mentionable" ';
                html += 'data-issuekey="' + issueKey + '" data-projectkey="' + projectKey + '" ';
                html += 'style="width:440px;" type="text" id="qandaquestiontext" name="qandaquestiontext">' + qtext + '</textarea>';
            html += '</div>';
        html += '</form>';
        return html;
    }

    function askQuestion(base, issueKey, projectKey) {
        console.log("adding question");

        var dialog = new AJS.Dialog({
            width:600,
            height:200,
            id:"quanda-addquestion",
            closeOnOutsideClick: false
        });
        dialog.addHeader(AJS.params.qaskTitle);
        dialog.addPanel("Panel1", createAskPanelContent(issueKey, projectKey, ''), "panel-body");
        dialog.get("panel:0").setPadding(10);

        dialog.addButton(AJS.params.qask, function() {
            var txt = AJS.$('#qandaquestiontext').val();
            if(txt.length > 0) {
                console.log("saving question on " + issueKey + " base: " + base);
                saveNewQuestion(base, issueKey);
                dialog.hide();
                dialog.remove();
            }
        }, "aui-button");

        dialog.addCancel(AJS.params.qcancel, function() {
            dialog.hide();
            dialog.remove();
        });

        dialog.show();
        dialog.updateHeight();
    }

    function reloadWindow() {
        AJS.dim();
        window.location.reload();
    }

    function saveNewQuestion(base, issueKey) {
        AJS.$.ajax ({
            type: 'POST',
        	url: base + "/rest/agrade/qanda/latest/panel/addquestion",
        	data: {
        	    issueKey : issueKey,
        	    question : AJS.$('#qandaquestiontext').val(),
        	},
        	success: function(data){
        	    if(data){
        	        console.log("added question: success");
        	        //reset the fields
        	    }
        	    reloadWindow();
        	},
        	error: function() {
        	    AJS.$('#quanda-error').empty();
        	    AJS.messages.error("#quanda-error", {
        	        title: AJS.params.qerrorSaveQTitle ,
                    body: AJS.params.qerrorLog
                });
                AJS.$('#quanda-error').removeClass('hidden');
        	}
        });
    }

    function addQuestionToIssue(base, qid) {
        AJS.$.ajax ({
            type: 'POST',
            url: base + "/rest/agrade/qanda/latest/panel/addtoissue",
            data: {
                questionId : qid,
            },
            success: function(data){
                if(data){
                    console.log("added question to issue: success");
                    //reset the fields
                }
                reloadWindow();
            },
            error: function() {
                AJS.$('#quanda-error').empty();
                AJS.messages.error("#quanda-error", {
                    title: AJS.params.qerrorAddToIssue,
                    body: AJS.params.qerrorLog
                });
                AJS.$('#quanda-error').removeClass('hidden');
            }
        });
    }

    function createRespondPanelContent(issueKey, projectKey, atext) {
        var html = '<form class="aui">';
            html += '<div class="field-group">';
                html += '<label for="qandaanswertext">'+ AJS.params.qanswerLabel +'</label>';
                html += '<textarea cols="50" rows="5" class="textarea long-field wiki-textfield qanda-mentionable" ';
                html += 'data-issuekey="' + issueKey + '" data-projectkey="' + projectKey + '" ';
                html += 'style="width:440px;" type="text" id="qandaanswertext" name="qandaanswertext">' + atext + '</textarea>';
            html += '</div>';
        html += '</form>';
        return html;
    }

    function respondToQuestion(base, issueKey, projectKey, qid) {
        console.log("answering question: " + qid);

        var dialog = new AJS.Dialog({
            width:600,
            height:200,
            id:"quanda-addanswer",
            closeOnOutsideClick: false
        });
        dialog.addHeader(AJS.params.qanswerTitle);
        dialog.addPanel("Panel1", createRespondPanelContent(issueKey, projectKey, ''), "panel-body");
        dialog.get("panel:0").setPadding(10);

        dialog.addButton(AJS.params.qanswer, function() {
            var txt = AJS.$('#qandaanswertext').val();
            if(txt.length > 0) {
                console.log("saving answer on question " + qid + " base: " + base);
                saveNewAnswer(base, qid);
                dialog.hide();
                dialog.remove();
            }
        }, "aui-button");

        dialog.addCancel(AJS.params.qcancel, function() {
            dialog.hide();
            dialog.remove();
        });

        dialog.show();
        dialog.updateHeight();
    }

    function saveNewAnswer(base, qid) {
        AJS.$.ajax ({
            type: 'POST',
            url: base + "/rest/agrade/qanda/latest/panel/addanswer",
            data: {
                questionId : qid,
                answer : AJS.$('#qandaanswertext').val(),
            },
            success: function(data){
                if(data){
                    console.log("added answer: success");
                    //reset the fields
                }
                reloadWindow();
            },
            error: function() {
                AJS.$('#quanda-error').empty();
                AJS.messages.error("#quanda-error", {
                    title: AJS.params.qerrorSaveATitle ,
                    body: AJS.params.qerrorLog
                });
                AJS.$('#quanda-error').removeClass('hidden');
            }
        });
    }

    function deleteQuestion(base, qid) {
        console.log("delete question: " + qid);

        AJS.$.ajax ({
            type: 'POST',
            url: base + "/rest/agrade/qanda/latest/panel/deletequestion",
            data: {
                questionId : qid,
            },
            success: function(data){
                if(data){
                    console.log("deleted question: success");
                }
                reloadWindow();
            }
        });
    }

    function editQuestion(base, issueKey, projectKey, qid) {
        console.log("edit question: " + qid);

        AJS.$.ajax ({
            type: 'POST',
            url: base + "/rest/agrade/qanda/latest/panel/questiontext",
            data: {
                questionId : qid,
            },
            dataType: 'text',
            success: function(data) {
                console.log("got text for question: success :" + data);
                var dialog = new AJS.Dialog({
                            width:600,
                            height:200,
                            id:"quanda-editquestion",
                            closeOnOutsideClick: false
                });
                dialog.addHeader(AJS.params.qEditQTitle);
                dialog.addPanel("Panel1", createAskPanelContent(issueKey, projectKey, data), "panel-body");
                dialog.get("panel:0").setPadding(10);

                dialog.addButton(AJS.params.qsave, function() {
                    var txt = AJS.$('#qandaquestiontext').val();
                    if(txt.length > 0) {
                        console.log("saving question" + qid + " base: " + base);
                        saveQuestion(base, qid, txt);
                        dialog.hide();
                        dialog.remove();
                    }
                }, "aui-button");

                dialog.addCancel(AJS.params.qcancel, function() {
                    dialog.hide();
                    dialog.remove();
                });

                dialog.show();
                dialog.updateHeight();
            }
        });
    }

    function saveQuestion(base, qid, qtext) {
        AJS.$.ajax ({
            type: 'POST',
            url: base + "/rest/agrade/qanda/latest/panel/editquestion",
            data: {
                questionId : qid,
                question : qtext,
            },
            success: function(data){
                if(data){
                    console.log("modified question: success");
                    //reset the fields
                }
                reloadWindow();
            },
            error: function() {
                AJS.$('#quanda-error').empty();
                AJS.messages.error("#quanda-error", {
                    title: AJS.params.qerrorSaveQTitle,
                    body: AJS.params.qerrorLog
                });
                AJS.$('#quanda-error').removeClass('hidden');
            }
        });
    }

    function toggleAnswerFlag(base, aid, flag) {
        AJS.$.ajax ({
            type: 'POST',
            url: base + "/rest/agrade/qanda/latest/panel/setapproval",
            data: {
                answerId : aid,
                approval: flag
            },
            success: function(data){
                if(data){
                    console.log("changed answer flag: success");
                }
                reloadWindow();
            }
        });
    }

    function approveAnswer(base, aid) {
        console.log("approve answer: " + aid);
        toggleAnswerFlag(base, aid, "true");
    }

    function clearApprovalAnswer(base, aid) {
        console.log("disapprove answer: " + aid);
        toggleAnswerFlag(base, aid, "false");
    }

    function deleteAnswer(base, aid) {
        console.log("delete answer: " + aid);
        AJS.$.ajax ({
            type: 'POST',
            url: base + "/rest/agrade/qanda/latest/panel/deleteanswer",
            data: {
                answerId : aid,
            },
            success: function(data){
                if(data){
                    console.log("delete answer: success");
                }
                reloadWindow();
            }
        });
    }
    
    function toggleAnswersBlock(trigger){
    	trigger = AJS.$(trigger);
    	var thread = trigger.closest(".qanda-question-thread");
    	if(trigger.hasClass("expanded")){
    		trigger.removeClass("expanded")
    			   .addClass("collapsed")
    			   .find(".icon")
    			   .removeClass("twixi-opened")
    			   .addClass("twixi-closed");
    		thread.find(".qanda-answers-panel").hide();
    	} else {
    		trigger.removeClass("collapsed")
    			   .addClass("expanded")
    			   .find(".icon")
    			   .removeClass("twixi-closed")
    			   .addClass("twixi-opened");
    		thread.find(".qanda-answers-panel").show();    		
    	}
    }

    function editAnswer(base, issueKey, projectKey, aid) {
        console.log("getting answer: " + aid);
        AJS.$.ajax ({
            type: 'POST',
            url: base + "/rest/agrade/qanda/latest/panel/answertext",
            data: {
                answerId : aid,
            },
            dataType: 'text',
            success: function(data) {
                console.log("edit answer: success :" + data);
                var dialog = new AJS.Dialog({
                            width:600,
                            height:200,
                            id:"quanda-addanswer",
                            closeOnOutsideClick: false
                        });
                dialog.addHeader(AJS.params.qEditATitle);
                dialog.addPanel("Panel1", createRespondPanelContent(issueKey, projectKey, data), "panel-body");
                dialog.get("panel:0").setPadding(10);

                dialog.addButton(AJS.params.qsave, function() {
                    var txt = AJS.$('#qandaanswertext').val();
                    if(txt.length > 0) {
                        console.log("saving answer " + aid + " base: " + base);
                        saveAnswer(base, aid, txt);
                        dialog.hide();
                        dialog.remove();
                    }
                }, "aui-button");

                dialog.addCancel(AJS.params.qcancel, function() {
                    dialog.hide();
                    dialog.remove();
                });

                dialog.show();
                dialog.updateHeight();
            }
        });
    }

    function saveAnswer(base, aid, atext) {
        AJS.$.ajax ({
            type: 'POST',
            url: base + "/rest/agrade/qanda/latest/panel/editanswer",
            data: {
                answerId : aid,
                answer : atext,
            },
            success: function(data){
                if(data){
                    console.log("added answer: success");
                    //reset the fields
                }
                reloadWindow();
            },
            error: function() {
                AJS.$('#quanda-error').empty();
                AJS.messages.error("#quanda-error", {
                    title: AJS.params.qerrorSaveATitle,
                    body: AJS.params.qerrorLog
                });
                AJS.$('#quanda-error').removeClass('hidden');
            }
        });
    }

    return {
        askQuestion: askQuestion,
        editQuestion: editQuestion,
        deleteQuestion: deleteQuestion,
        addQuestionToIssue: addQuestionToIssue,
        respondToQuestion: respondToQuestion,
        approveAnswer: approveAnswer,
        clearApprovalAnswer: clearApprovalAnswer,
        deleteAnswer : deleteAnswer,
        editAnswer : editAnswer,
        toggleAnswersBlock : toggleAnswersBlock
    }
})();

QANDA.Mention = JIRA.Mention.extend({
    init: function () {
        var instance = this;
        if (JIRA.Version.isGreaterThanOrEqualTo("6.3")) {
            this.listController = new JIRA.MentionGroup();
        } else {
            this.listController = new AJS.MentionGroup();
        }

        this.dataSource = new JIRA.ProgressiveDataSet([], {
            model: JIRA.MentionUserModel,
            queryEndpoint: contextPath + "/rest/agrade/qanda/latest/mentions/search",
            queryParamKey: "username",
            queryData: _.bind(this._getQueryParams, this)
        });
        this.dataSource.matcher = function(model, query) {
            var matches = false;
            matches = matches || instance._stringPartStartsWith(model.get("name"), query);
            matches = matches || instance._stringPartStartsWith(model.get("displayName"), query);
            return matches;
        };
        this.dataSource.bind('respond', function(response) {
            var results = response.results;
            var username = response.query;

            if (!username) return;

            // Update the state of mentions matches
            if (!results.length) {
                if (username) {
                    if (instance.dataSource.hasQueryCache(username)) {
                        if (!instance.lastInvalidUsername || username.length <= instance.lastInvalidUsername.length) {
                            instance.lastInvalidUsername = username;
                        }
                    }
                }
                instance.lastRequestMatch = false;
            } else {
                instance.lastInvalidUsername = "";
                instance.lastValidUsername = username;
                instance.lastRequestMatch = true;
            }

            // Set the results
            var $suggestions = instance.generateSuggestions(results, username);
            instance.updateSuggestions($suggestions);
        });
        this.dataSource.bind('activity', function(response) {
            if (response.activity) {
                instance.layerController._showLoading();
            } else {
                instance.layerController._hideLoading();
            }
        });
    }
});

AJS.$(document).ready(function() {
    // the add button for questions
    AJS.$('#quanda_addquestion').live("click", function(e) {
        QANDA.askQuestion(AJS.$('#qandaparameters').attr('baseUrl'),
                          AJS.$('#qandaparameters').attr('issueKey'),
                          AJS.$('#qandaparameters').attr('projectKey'));
    });

    AJS.$('a[id^="quanda_delquestion_"]').live("click", function(e) {
        QANDA.deleteQuestion(AJS.$('#qandaparameters').attr('baseUrl'),
                             AJS.$(this).attr('questionId'));
    });

    AJS.$('a[id^="quanda_editquestion_"]').live("click", function(e) {
        QANDA.editQuestion(AJS.$('#qandaparameters').attr('baseUrl'),
                           AJS.$('#qandaparameters').attr('issueKey'),
                           AJS.$('#qandaparameters').attr('projectKey'),
                           AJS.$(this).attr('questionId'));
    });

    AJS.$('a[id^="quanda_adddescquestion_"]').live("click", function(e) {
        QANDA.addQuestionToIssue(AJS.$('#qandaparameters').attr('baseUrl'),
                                 AJS.$(this).attr('questionId'));
    });


    AJS.$('a[id^="quanda_addanswer_"]').live("click", function(e) {
        QANDA.respondToQuestion(AJS.$('#qandaparameters').attr('baseUrl'),
                                AJS.$('#qandaparameters').attr('issueKey'),
                                AJS.$('#qandaparameters').attr('projectKey'),
                                AJS.$(this).attr('questionId'));
    });

    AJS.$('a[id^="quanda_approvelink_"]').live("click", function(e) {
        QANDA.approveAnswer(AJS.$('#qandaparameters').attr('baseUrl'),
                            AJS.$(this).attr('answerId'));
    });

    AJS.$('a[id^="quanda_disapprovelink_"]').live("click", function(e) {
        QANDA.clearApprovalAnswer(AJS.$('#qandaparameters').attr('baseUrl'),
                                  AJS.$(this).attr('answerId'));
    });

    AJS.$('a[id^="quanda_editanswer_"]').live("click", function(e) {
            QANDA.editAnswer(AJS.$('#qandaparameters').attr('baseUrl'),
                             AJS.$('#qandaparameters').attr('issueKey'),
                             AJS.$('#qandaparameters').attr('projectKey'),
                             AJS.$(this).attr('answerId'));
        });

    AJS.$('a[id^="quanda_deleteanswer_"]').live("click", function(e) {
        QANDA.deleteAnswer(AJS.$('#qandaparameters').attr('baseUrl'),
                           AJS.$(this).attr('answerId'));
    });
    
    AJS.$('.qanda-question-panel .twixi-trigger').live("click", function(){
    	QANDA.toggleAnswersBlock(AJS.$(this));
    });


    // QANDA mentions
    var mentionsCtr = QANDA.Mention;
    var mentionsController;

    function initMentions() {
        if (!mentionsController) {
            mentionsController = new mentionsCtr();
        }
        mentionsController.textarea(this);
    }

    AJS.$(document).delegate(".qanda-mentionable", "focus", initMentions);
    AJS.$(".qanda-mentionable").each(initMentions);

    //set the title
    if(AJS.$('#qandaparameters').length > 0 &&
       '0' != AJS.$('#qandaparameters').attr('totalQuestions')) {
        var t = AJS.$('#qanda-tabpanel').text();
        t += '(' +  AJS.$('#qandaparameters').attr('unresolvedQuestions') + '/' + AJS.$('#qandaparameters').attr('totalQuestions') + ')';
        AJS.$('#qanda-tabpanel').html('<strong>' + t + '</strong>');
    }


    if(JIRA && JIRA.ViewIssueTabs){
        JIRA.ViewIssueTabs.onTabReady(function() {
            AJS.$.extend(AJS.params,JIRA.parseOptionsFromFieldset( AJS.$("#qandaParameterContainer").find(".parameters") ))
        })
    }
});
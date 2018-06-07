var controller = {
    __name: 'hipa.controller.QuestionListController',

    __templates: ['/public/views/questionList.ejs', '/public/views/questionForm.ejs'],

    questionListLogic: hipa.logic.QuestionListLogic,
    questionDataModel: hipa.data.QuestionDataModel,
    socket: io('/socket/question'),
  

    __construct: function() {
      this.socket.on('ADD_QUESTION', (data) => {
        this.questionListLogic.addToLocal(data);
      });

      this.socket.on('DELETE_QUESTION', (data) => {
        this.questionListLogic.deleteFromLocal(data.id);
      });

      this.socket.on('UPDATE_QUESTION', (data) => {
        const question_id = data.id;
        const like_cnt = data.like_cnt;
        this.questionListLogic.updateLikesFromLocal(question_id, like_cnt);
      });

      this.socket.on('DELETE_ALL', (data) => {
        this.questionListLogic.deleteAllInLocal();
      });
    },

    __init: function(context) {
      //const indicator = this.triggerIndicator();
      //indicator.show();
      this.view.update('#question-list-container', 'questionList', null);

      this.questionListLogic.getQuestionList().done((questionList)=>{
        this.view.bind( 'h5view#question-list', {
          questionList,
        });
      });

      this.view.update('#question-form-container', 'questionForm', null);
    },

    '#question-submit-btn click': function() {
      this._submitForm();
    },

     _getQuestionId: function($el) {
      return $el.closest('.question-div').attr('question-id');
    },

    _submitForm: function() {
      const $nickname = this.$find('#question-form input[name=nickname]');
      const $password = this.$find('#question-form input[name=password]');
      const $isSlideNumberIncluded = this.$find('#question-form input[name=current_slide]');
      const $question = this.$find('#question-form textarea[name=question]');

      const isSlideNumberIncluded = $isSlideNumberIncluded.prop('checked');
      const slideNumberValue = Reveal.getState().indexh;
      const slideNumber = isSlideNumberIncluded ? slideNumberValue : null;

      this.questionListLogic.add($question.val(), $nickname.val(), slideNumber, $password.val()).done(() => {
        $nickname.val(null);
        $isSlideNumberIncluded.prop('checked', false);
        $question.val(null);
        $password.val(null);

      }).fail(() => {
        alert('failed to add question');
      });

      return false;
    },

   

    _getQuestionDiv: function($el) {
      return $el.closest('.question-div');
    },

    _getDeleteModal: function() {
      return this.$find('#delete-question-dialog');
    },

    _deleteQuestionId: null,

    '#question-list button.delete click': function(context, $el) {
      const $questionDiv = this._getQuestionDiv($el);
      const questionId = this._getQuestionId($el);
      this._deleteQuestionId = questionId;
      const $deleteModal = this._getDeleteModal();
      const question = questionDataModel.get(questionId).get('question');
      function truncate(string, length){
        if (string.length > length)
            return string.substring(0, length)+'...';
        else
            return string;
      };
      $deleteModal.find('.modal-card-title').text('Delete question "' + truncate(question, 25) + '"?');
      $deleteModal.addClass('is-active');
    },

    '#delete-question-btn click': function(context, $el) {
      const password = this.$find('#delete-question-dialog input[type=password]').val();
      this.questionListLogic.delete(this._deleteQuestionId, password).done(() => {
        this._getDeleteModal().removeClass('is-active');
      }).fail( (errMsg) => {
        alert('Failed to delete question : ' + errMsg);
      });
    },

    '#delete-question-dialog button.delete click': function(context, $el) {
      this._getDeleteModal().removeClass('is-active');
    },

    '#delete-question-dialog #delete-question-cancel-btn click': function(context, $el) {
      this._getDeleteModal().removeClass('is-active');
    },

    '#question-list .like-button click' : function(context, $el) {
      const questionId = this._getQuestionId($el);
      this.questionListLogic.toggleLike(questionId).done(()=> {
      })
    }
  };
  h5.core.expose(controller);

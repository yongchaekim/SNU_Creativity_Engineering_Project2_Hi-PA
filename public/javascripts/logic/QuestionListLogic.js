var questionListLogic = {
  __name: 'hipa.logic.QuestionListLogic',
  model: hipa.data.QuestionDataModel,
  questionList: h5.core.data.createObservableArray(),

  getQuestionList: function() {
    return h5.ajax({
      type: 'GET',
      dataType: 'JSON',
      url: config.url + '/question',
    }).then((json) => {
      const modelList = this.model.create(json);
      this.questionList.splice(0,this.questionList.length);
      this.questionList.copyFrom(modelList);
      return this.questionList;
    });
  },

  deleteAllInLocal: function() {
    this.model.removeAll();
    this.questionList.splice(0, this.questionList.length);
    this.questionList.length = 0;
  },

  add: function(question, nickname, slideNumber, password) {
    return h5.ajax({
      type: 'POST',
      dataType: 'JSON',
      url: config.url + '/question',
      data: { question, nickname, slideNumber, password },
    }).then((json) => {
      // FIXME: consider the case where question being created twice.
      // const questionModelItem = this.model.create(json);
      // this.questionList.push(questionModelItem);
    });
  },

  delete: function(question_id, password) {
    return h5.ajax({
      type: 'DELETE',
      url: config.url + '/question/' + question_id,
      data: { password },
    }).then(() => {
      // for (let i = 0, len = this.questionList.length; i < len; i++) {
      //   if (this.questionList.get(i).get('id') === question_id) {
      //     this.model.remove(question_id);
      //     this.questionList.splice(i, 1);
      //     break;
      //   }
      // }
    });
  },

  toggleLike: function(question_id) {
    const questionModel = this.model.get(question_id);
    const isLiked = questionModel.get('isLiked');
    const origLike = questionModel.get('like');
    questionModel.set('isLiked', !isLiked);
    // questionModel.set('like', origLike + (isLiked ? -1 : +1));
    return h5.ajax({
      type: 'PUT',
      url: config.url + '/question/' + (isLiked ? 'dislike/' : 'like/') + question_id,
    }).then((msg) => {

    }).fail( () => { // If failed
      questionModel.set('isLiked', isLiked);
      // questionModel.set('like', origLike);
    });
  },

  toggleDelete: function(question_id) {
    const question = this._getQuestion(question_id);
    question.set('isDeleteShown', !question.get('isDeleteShown'));
  },

  refreshLiked: function(question_id, num) {
    const questionModel = questionDataModel.get(question_id);
    questionModel.set('liked', num);
    return;
  },

  addToLocal: function(json) {
    if (this.model.get(json.id) === undefined) {
      return;
    }
    const questionModelItem = this.model.create(json);
    this.questionList.push(questionModelItem);
  },

  deleteFromLocal: function(question_id) {
    for (let i = 0, len = this.questionList.length; i < len; i++) {
      if (this.questionList.get(i).get('id') === question_id) {
        this.model.remove(question_id);
        this.questionList.splice(i, 1);
        break;
      }
    }
  },

  updateLikesFromLocal: function(question_id, like_cnt) {
    this.model.get(question_id).set('like', like_cnt);
  },

  _getQuestion: function(question_id) {
    return this.model.get(question_id);
  },
}

h5.core.expose(questionListLogic);

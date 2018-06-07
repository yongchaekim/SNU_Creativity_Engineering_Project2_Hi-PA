var questionListLogic = {
  __name: 'hipa.logic.QuestionListLogic',
  model: hipa.data.QuestionDataModel,
  questionList: h5.core.data.createObservableArray(),
  duration: 1000,
  sequence: h5.core.data.createSequence(1, 1, h5.core.data.SEQ_STRING),

  getQuestionList: function() {
    var dfd = this.deferred();
    setTimeout(()=> {
      const tmpList = Array.apply(null, Array(6)).map((ele, index) => {
        return this._createFakeQuestion();
      });
      const modelList = this.model.create(tmpList);
      this.questionList.splice(0,this.questionList.length);
      this.questionList.copyFrom(modelList);
      dfd.resolve(this.questionList);
    }, this.duration);
    return dfd.promise();
  },

  add: function(question, nickname, slideNumber, password) {
    var dfd = this.deferred();
    setTimeout(() => {
      const tmpQuestion = {
        id: this.sequence.next(),
        question,
        nickname,
        slideNumber,
        time: Date.now(),
      }
      // FIXME: consider the case where question being created twice.
      const questionModelItem = this.model.create(tmpQuestion);
      this.questionList.push(questionModelItem);
      dfd.resolve(questionModelItem);
    }, this.duration);
    return dfd.promise();
  },

  delete: function(question_id, password) {
    var dfd = this.deferred();
    setTimeout(() => {
      for (let i = 0, len = this.questionList.length; i < len; i++) {
        if (this.questionList.get(i).get('id') === question_id) {
          this.model.remove(question_id);
          this.questionList.splice(i, 1);
          break;
        }
      }
      dfd.resolve();
    }, this.duration);
    return dfd.promise();
  },

  toggleDelete: function(question_id) {
    const question = this._getQuestion(question_id);
    question.set('isDeleteShown', !question.get('isDeleteShown'));
  },

  toggleLike: function(question_id) {
    var dfd = this.deferred();
    setTimeout(() => {
      const questionModel = this.model.get(question_id);
      const isLiked = questionModel.get('isLiked');
      const origLike = questionModel.get('like');
      questionModel.set('isLiked', !isLiked);
      questionModel.set('like', origLike + (isLiked ? -1 : +1));
      dfd.resolve();
    }, this.duration);
    return dfd.promise();
  },

  addToLocal: function(json) {
    // FIXME: consider the case where question being created twice.
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

  _createFakeQuestion: function() {
    const id = this.sequence.next();
    return {
      id: id,
      question : "Fake Question " + id,
      nickname: "Fake Nickname " + id,
      slideNumber: Math.random() > 0.5 ? null : Math.floor(Math.random() * 20),
      time: 1381216317325 + Math.floor(Math.random() * 1000000),
      like: Math.floor(Math.random() * 10),
    };
  },

  _getQuestion: function(question_id) {
    return this.model.get(question_id);
  },
}

h5.core.expose(questionListLogic);
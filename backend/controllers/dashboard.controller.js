const ChatSessionModel = require('../models/chatSession.model');
const ChatMessageModel = require('../models/chatMessage.model');
const UnansweredQueryModel = require('../models/unansweredQuery.model');
const { ok } = require('../utils/response');

// FR-5.1, FR-5.2: statistik pertanyaan populer & tren volume
function stats(req, res) {
  const days = Number(req.query.days || 14);
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const popularQuestions = ChatMessageModel.popularQuestions(10, sinceIso);
  const trend = ChatSessionModel.trendByDay(days);

  const summary = {
    total_sessions: ChatSessionModel.countAll(),
    sessions_in_range: ChatSessionModel.countInRange(sinceIso),
    total_messages: ChatMessageModel.countAll(),
    total_answered: ChatMessageModel.countAnswered(),
    total_unanswered: ChatMessageModel.countUnanswered(),
    unanswered_by_status: UnansweredQueryModel.countByStatus(),
  };

  return ok(res, {
    range_days: days,
    summary,
    popular_questions: popularQuestions,
    session_trend: trend,
  }, 'Statistik dashboard');
}

module.exports = { stats };

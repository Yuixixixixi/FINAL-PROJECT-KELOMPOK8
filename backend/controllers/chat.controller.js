const KnowledgeBaseModel = require('../models/knowledgeBase.model');
const ChatSessionModel = require('../models/chatSession.model');
const ChatMessageModel = require('../models/chatMessage.model');
const UnansweredQueryModel = require('../models/unansweredQuery.model');
const BotProfileModel = require('../models/botProfile.model');
const { findBestMatch } = require('../services/similarity.service');
const { ok, created, fail } = require('../utils/response');

// Mulai sesi chat baru (FR-1.4: identitas sesi)
function startSession(req, res) {
  const session = ChatSessionModel.create();
  const profile = BotProfileModel.get();
  return created(res, {
    session_identifier: session.session_identifier,
    bot: {
      nama_bot: profile.nama_bot,
      pesan_sapaan: profile.pesan_sapaan,
      avatar: profile.avatar,
    },
  }, 'Sesi chat dimulai');
}

// FR-2.1 s/d FR-2.3, FR-4.1: kirim pesan, cocokkan dengan KB, catat jika tak terjawab
function sendMessage(req, res) {
  const { session_identifier, message } = req.body;

  if (!message || !message.trim()) {
    return fail(res, 'Pesan tidak boleh kosong', 422);
  }

  const session = ChatSessionModel.findOrCreateByIdentifier(session_identifier);
  const profile = BotProfileModel.get();
  const variants = KnowledgeBaseModel.findAllVariantsForMatching();

  const { bestMatch, score } = findBestMatch(message, variants);
  const isAnswered = !!bestMatch && score >= profile.threshold;

  const chatMessage = ChatMessageModel.create({
    sessionId: session.id,
    pesanUser: message.trim(),
    matchedKnowledgeId: isAnswered ? bestMatch.knowledge_id : null,
    similarityScore: score,
    isAnswered,
  });

  let answerText = profile.pesan_fallback;
  let kategori = null;

  if (isAnswered) {
    answerText = bestMatch.jawaban;
    kategori = bestMatch.kategori;
  } else {
    // FR-4.1: catat ke Unanswered Query Inbox
    UnansweredQueryModel.create({
      chatMessageId: chatMessage.id,
      pertanyaan: message.trim(),
    });
  }

  return created(res, {
    session_identifier: session.session_identifier,
    message: {
      id: chatMessage.id,
      pesan_user: chatMessage.pesan_user,
      jawaban: answerText,
      is_answered: isAnswered,
      similarity_score: Number(score.toFixed(4)),
      kategori,
      timestamp: chatMessage.timestamp,
    },
  }, isAnswered ? 'Pertanyaan terjawab' : 'Pertanyaan belum dapat dijawab otomatis');
}

// Riwayat percakapan untuk satu sesi (opsional, untuk reload widget chat)
function getSessionHistory(req, res) {
  const { session_identifier } = req.params;
  const session = ChatSessionModel.findByIdentifier(session_identifier);
  if (!session) return ok(res, { messages: [] }, 'Sesi belum memiliki riwayat');

  const messages = ChatMessageModel.findBySession(session.id);
  return ok(res, { messages }, 'Riwayat sesi ditemukan');
}

module.exports = { startSession, sendMessage, getSessionHistory };

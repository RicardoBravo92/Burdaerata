import { api } from "@/lib/api";

export interface QuestionCardListItem {
  id: string;
  blank_count: number;
}

export interface QuestionCard extends QuestionCardListItem {
  text: string;
}

export interface AnswerCardListItem {
  id: string;
}

export interface AnswerCard extends AnswerCardListItem {
  text: string;
}

class CardService {
  private questionCache: QuestionCardListItem[] | null = null;
  private answerCache: AnswerCardListItem[] | null = null;
  private questionTextCache: Map<string, string> = new Map();
  private answerTextCache: Map<string, string> = new Map();

  async getQuestions(): Promise<QuestionCardListItem[]> {
    if (this.questionCache) return this.questionCache;
    const questions = await api.get<QuestionCardListItem[]>("/api/v1/cards/questions");
    this.questionCache = questions;
    return questions;
  }

  async getQuestion(id: string): Promise<QuestionCard> {
    if (this.questionTextCache.has(id)) {
      const cached = this.questionCache?.find((q) => q.id === id);
      if (cached) {
        return { ...cached, text: this.questionTextCache.get(id)! };
      }
    }
    const question = await api.get<QuestionCard>(`/api/v1/cards/questions/${id}`);
    this.questionTextCache.set(id, question.text);
    return question;
  }

  async getAnswers(): Promise<AnswerCardListItem[]> {
    if (this.answerCache) return this.answerCache;
    const answers = await api.get<AnswerCardListItem[]>("/api/v1/cards/answers");
    this.answerCache = answers;
    return answers;
  }

  async getAnswer(id: string): Promise<AnswerCard> {
    if (this.answerTextCache.has(id)) {
      return { id, text: this.answerTextCache.get(id)! };
    }
    const answer = await api.get<AnswerCard>(`/api/v1/cards/answers/${id}`);
    this.answerTextCache.set(id, answer.text);
    return answer;
  }

  async getAnswersText(ids: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const uncached = ids.filter((id) => !this.answerTextCache.has(id));

    if (uncached.length > 0) {
      await Promise.all(uncached.map((id) => this.getAnswer(id)));
    }

    ids.forEach((id) => {
      const text = this.answerTextCache.get(id);
      if (text) result[id] = text;
    });

    return result;
  }

  async getQuestionText(id: string): Promise<string> {
    if (this.questionTextCache.has(id)) {
      return this.questionTextCache.get(id)!;
    }
    const question = await this.getQuestion(id);
    return question.text;
  }

  clearCache() {
    this.questionCache = null;
    this.answerCache = null;
    this.questionTextCache.clear();
    this.answerTextCache.clear();
  }
}

export const cardService = new CardService();

import { cardService } from "@/services/cardService";

export async function getCardAnswer(id: string) {
  return cardService.getAnswer(id);
}

export async function getCardQuestion(id: string) {
  return cardService.getQuestion(id);
}

export async function getAnswersText(ids: string[]) {
  return cardService.getAnswersText(ids);
}

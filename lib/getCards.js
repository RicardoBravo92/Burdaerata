import { answers, questions } from "@/constants/cardsData.json";

export const getCardAnswer = (id) => {
  const card = answers.find((item) => item.id === id);
  if (card) {
    return card;
  }
  return null;
};
//get card question
export const getCardQuestion = (id) => {
  const card = questions.find((item) => item.id === id);
  if (card) {
    return card;
  }
  return null;
};

import dynamic from "next/dynamic";

export const Bot = dynamic(
  () => import('../../modules/bot/Bot'),
  {
    ssr: false,
  }
);

function BotPage() {
  return (
    <Bot />
  );
}

export default BotPage;
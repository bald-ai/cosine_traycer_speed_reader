import ReaderApp from "@/components/reader/ReaderApp";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [{ bookId: "la-sangre-de-los-elfos" }];
}

export default function ReaderPage(props: { params: { bookId: string } }) {
  const { bookId } = props.params;
  return <ReaderApp bookId={bookId} />;
}
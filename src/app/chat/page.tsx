import Link from "next/link";

export default function Chat() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-4xl font-bold">Chat with your documents</h1>
      <p className="text-lg">
        This feature is coming soon! Stay tuned.
      </p>
      <div className="flex gap-4">
        <Link
          href="/upload"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upload PDF
        </Link>
      </div>
    </div>
  );
}

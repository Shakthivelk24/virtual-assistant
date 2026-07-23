export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex space-x-2">
        <div className="h-3 w-3 rounded-full bg-blue-600 animate-bounce"></div>
        <div
          className="h-3 w-3 rounded-full bg-blue-600 animate-bounce"
          style={{ animationDelay: "0.15s" }}
        ></div>
        <div
          className="h-3 w-3 rounded-full bg-blue-600 animate-bounce"
          style={{ animationDelay: "0.3s" }}
        ></div>
      </div>
    </div>
  );
}
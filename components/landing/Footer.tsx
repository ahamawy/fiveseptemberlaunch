import strings from "@/content/strings.en.json";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 py-8">
      <div className="mx-auto max-w-5xl px-6 text-center text-white/60 text-sm">
        {(strings as any).footer.disclaimer}
      </div>
    </footer>
  );
}


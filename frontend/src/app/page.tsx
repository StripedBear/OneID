import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-semibold">OneID — живая записная книжка</h1>
      <p className="text-slate-300">
        У вас один постоянный адрес. Все каналы связи — в одном месте. Обновили номер — ссылку менять не нужно.
      </p>
      <div className="flex gap-3">
        <Link href="/register" className="rounded-2xl px-4 py-2 bg-slate-100 text-slate-900">Начать</Link>
        <Link href="/login" className="rounded-2xl px-4 py-2 border border-slate-700">У меня уже есть аккаунт</Link>
      </div>
    </div>
  );
}

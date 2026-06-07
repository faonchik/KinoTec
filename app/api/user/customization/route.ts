import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Кастомизация из магазина отключена" },
    { status: 410 }
  );
}


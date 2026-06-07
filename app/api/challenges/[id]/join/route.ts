import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  void req;
  await context.params;
  return NextResponse.json(
    { error: "Челленджи отключены" },
    { status: 410 }
  );
}


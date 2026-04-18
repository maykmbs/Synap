const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL ?? 'http://localhost:8000';

export interface ClassifyRequest {
  text: string;
  user_hint?: string;
}

export interface ClassifyResponse {
  type: string;
  confidence: number;
  data: Record<string, unknown>;
}

export async function classifyText(
  payload: ClassifyRequest,
  jwt: string
): Promise<ClassifyResponse> {
  const res = await fetch(`${AI_SERVICE_URL}/classify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Classify error: ${res.status}`);
  }

  return res.json();
}

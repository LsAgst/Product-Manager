const DEFAULT_HEADERS: HeadersInit = {
  "Content-Type": "application/json"
};

type ApiProblemLike = {
  title?: string;
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
};

function getApiErrorMessage(responseStatus: number, body: string): string {
  if (!body) {
    return `Requisicao falhou com status ${responseStatus}`;
  }

  try {
    const parsed = JSON.parse(body) as ApiProblemLike;

    const validationEntries = parsed.errors ? Object.entries(parsed.errors) : [];
    if (validationEntries.length > 0) {
      const [field, messages] = validationEntries[0];
      const firstMessage = messages?.[0] ?? "Erro de validacao.";
      return `${field}: ${firstMessage}`;
    }

    if (parsed.detail && parsed.title) {
      return `${parsed.title}: ${parsed.detail}`;
    }

    if (parsed.detail) {
      return parsed.detail;
    }

    if (parsed.title) {
      return parsed.title;
    }

    if (parsed.message) {
      return parsed.message;
    }
  } catch {
    // Ignore JSON parse errors and fallback to plain text.
  }

  return body;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    let message = `Requisicao falhou com status ${response.status}`;

    try {
      const body = await response.text();
      message = getApiErrorMessage(response.status, body);
    } catch {
      // Ignore body parse errors and keep default message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

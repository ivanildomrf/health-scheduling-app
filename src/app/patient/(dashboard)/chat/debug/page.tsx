import { getPatientConversations } from "@/actions/get-patient-conversations";
import { getPatientSession } from "@/helpers/patient-session";

export default async function DebugChatPage() {
  const session = await getPatientSession();

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Erro: Sem sessão</h1>
        <p>Não foi possível obter a sessão do paciente.</p>
        <pre className="mt-4 rounded bg-gray-100 p-4">
          {JSON.stringify({ session }, null, 2)}
        </pre>
      </div>
    );
  }

  let conversationsResult;
  let error;

  try {
    conversationsResult = await getPatientConversations({
      patientId: session.patientId,
    });
  } catch (err) {
    error = err;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Debug Chat Page</h1>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Sessão:</h2>
        <pre className="mt-2 rounded bg-gray-100 p-4">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Resultado da Action:</h2>
        <pre className="mt-2 rounded bg-gray-100 p-4">
          {error
            ? JSON.stringify({ error: String(error) }, null, 2)
            : JSON.stringify(conversationsResult, null, 2)}
        </pre>
      </div>
    </div>
  );
}

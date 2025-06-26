import { getPatientConversations } from "@/actions/get-patient-conversations";
import { getPatientSession } from "@/helpers/patient-session";

export default async function DebugChatPage() {
  console.log("=== Debug Chat Page ===");

  const session = await getPatientSession();
  console.log("Session:", session);

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
    console.log("Calling action with patientId:", session.patientId);
    conversationsResult = await getPatientConversations({
      patientId: session.patientId,
    });
    console.log("Action result:", conversationsResult);
  } catch (err) {
    error = err;
    console.error("Action error:", err);
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

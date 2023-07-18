import { useRouter } from "next/router";
import Card from "../../../components/card";

type Error = 'Configuration' | 'AccessDenied' | 'Verification' | 'Default'

export default function Error() {
  const router = useRouter();
  const { error } = router.query;
  // Generate a error message based on the error code (next-auth)
  const errorMessage = generateErrorMessage(error as Error);

  return(
    <>
    <main className="flex min-h-screen flex-col items-center justify-center py-2">
      <Card>
        <h1 className="text-4xl font-bold">Error</h1>
        <p className="mt-4 text-2xl">{errorMessage}</p>
      </Card>
    </main>
  </>
  );
}

function generateErrorMessage(error: Error): string {
  switch(error) {
    case 'Configuration':
      return 'There is a problem with the server configuration. Check if your options are correct.'
    case 'AccessDenied':
      return 'You are not allowed to sign in.'
    case 'Verification':
      return 'Your token is expired or has already been used.'
    default:
      return 'An unknown error has occurred.'
  }
}
import {
  AzureCommunicationTokenCredential,
  CommunicationUserIdentifier,
} from '@azure/communication-common';
import {
  CallComposite,
  ChatComposite,
  fromFlatCommunicationIdentifier,
  useAzureCommunicationCallAdapter,
  useAzureCommunicationChatAdapter,
} from '@azure/communication-react';
import React, {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatClient } from '@azure/communication-chat';
import { initializeIcons } from '@fluentui/react';
import { generateRoomUrl } from './utils/roomUtils';

/**
 * Authentication information needed for your client application to use
 * Azure Communication Services.
 *
 * For this quickstart, you can obtain these from the Azure portal as described here:
 * https://docs.microsoft.com/en-us/azure/communication-services/quickstarts/identity/quick-create-identity
 *
 * In a real application, your backend service would provide these to the client
 * application after the user goes through your authentication flow.
 */
const ENDPOINT_URL = 'https://cs-dev-us-livestream.unitedstates.communication.azure.com/';
const USER_ID = '8:acs:943cc36e-35ac-4e4a-a8c6-904c7917365a_00000022-1a18-3ae8-f883-08482200d84e';
const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjYwNUVCMzFEMzBBMjBEQkRBNTMxODU2MkM4QTM2RDFCMzIyMkE2MTkiLCJ4NXQiOiJZRjZ6SFRDaURiMmxNWVZpeUtOdEd6SWlwaGsiLCJ0eXAiOiJKV1QifQ.eyJza3lwZWlkIjoiYWNzOjk0M2NjMzZlLTM1YWMtNGU0YS1hOGM2LTkwNGM3OTE3MzY1YV8wMDAwMDAyMi0xYTE4LTNhZTgtZjg4My0wODQ4MjIwMGQ4NGUiLCJzY3AiOjE3OTIsImNzaSI6IjE3MjQzMzIyODMiLCJleHAiOjE3MjQ0MTg2ODMsInJnbiI6ImFtZXIiLCJhY3NTY29wZSI6ImNoYXQsdm9pcCIsInJlc291cmNlSWQiOiI5NDNjYzM2ZS0zNWFjLTRlNGEtYThjNi05MDRjNzkxNzM2NWEiLCJyZXNvdXJjZUxvY2F0aW9uIjoidW5pdGVkc3RhdGVzIiwiaWF0IjoxNzI0MzMyMjgzfQ.iaUYvYUNogBZBWMXHFaQolnqG0Lq5UTIQ9GNNNtrwYY8yBASgpDtr7O4ofK6l6IDlx0cMUrDiE9hafVYcaxdGBi4A71XsaGiYspacp2VJR0XampXi6GFyLin4OTY_BTBS5BufB8GUmtK7eCrnEd7IRLg1P8h5boYkb0O_jJ5my5t2lDvRP99FqTeVpV-Kz0H_U49pMoZHNeFtllqUWZEiFYZuin2qeooFs4tgF2Sbo0Q5WBd8yiv_rnc_en-2PC42PDo3lRriw5bJ7_RHssytFBgCVYUG5i_BMEosEAMuT032-LYZBw9pEYGUigJCxXBcAbZ_OzkrL_wWqvX1ftNiA';

/**
 * Display name for the local participant.
 * In a real application, this would be part of the user data that your
 * backend services provides to the client application after the user
 * goes through your authentication flow.
 */
const DISPLAY_NAME = '<Display Name>';

initializeIcons();

/**
 * Entry point of your application.
 */
function App(): JSX.Element {
  // Arguments that would usually be provided by your backend service or
  // (indirectly) by the user.
  const { endpointUrl, userId, token, displayName, groupId, threadId } =
    useAzureCommunicationServiceArgs();

  // A well-formed token is required to initialize the chat and calling adapters.
  const credential = useMemo(() => {
    try {
      return new AzureCommunicationTokenCredential(token);
    } catch {
      console.error('Failed to construct token credential');
      return undefined;
    }
  }, [token]);

  // Memoize arguments to `useAzureCommunicationCallAdapter` so that
  // a new adapter is only created when an argument changes.
  const callAdapterArgs = useMemo(
    () => ({
      userId: fromFlatCommunicationIdentifier(
        userId
      ) as CommunicationUserIdentifier,
      displayName,
      credential,
      locator: {
        groupId,
      },
    }),
    [userId, credential, displayName, groupId]
  );
  const callAdapter = useAzureCommunicationCallAdapter(callAdapterArgs);

  // Memoize arguments to `useAzureCommunicationChatAdapter` so that
  // a new adapter is only created when an argument changes.
  const chatAdapterArgs = useMemo(
    () => ({
      endpoint: endpointUrl,
      userId: fromFlatCommunicationIdentifier(
        userId
      ) as CommunicationUserIdentifier,
      displayName,
      credential,
      threadId,
    }),
    [endpointUrl, userId, displayName, credential, threadId]
  );
  const chatAdapter = useAzureCommunicationChatAdapter(chatAdapterArgs);

  if (!!callAdapter && !!chatAdapter) {
    // Generate a joinable URL
    const joinableUrl = generateRoomUrl(groupId);
    return (
      <div style={{ height: '100vh', display: 'flex' }}>
        <div style={containerStyle}>
          <CallComposite adapter={callAdapter} />
        </div>
        <div>
          <h4>Call Room URL:</h4>
          <a href={joinableUrl} target="_blank" rel="noopener noreferrer">{joinableUrl}</a>
        </div>
        <div style={containerStyle}>
          <ChatComposite adapter={chatAdapter} />
        </div>
      </div>
    );
  }
  if (credential === undefined) {
    return (
      <h3>Failed to construct credential. Provided token is malformed.</h3>
    );
  }
  return <h3>Initializing...</h3>;
}

const containerStyle: CSSProperties = {
  border: 'solid 0.125rem olive',
  margin: '0.5rem',
  width: '50vw',
};
/**
 * This hook returns all the arguments required to use the Azure Communication services
 * that would be provided by your backend service after user authentication
 * depending on the user-flow (e.g. which chat thread to use).
 */
function useAzureCommunicationServiceArgs(): {
  endpointUrl: string;
  userId: string;
  token: string;
  displayName: string;
  groupId: string;
  threadId: string;
} {
  const [threadId, setThreadId] = useState('');
  // For the quickstart, create a new thread with just the local participant in it.
  useEffect(() => {
    (async () => {
      const client = new ChatClient(
        ENDPOINT_URL,
        new AzureCommunicationTokenCredential(TOKEN)
      );
      const { chatThread } = await client.createChatThread(
        {
          topic: 'Composites Quickstarts',
        },
        {
          participants: [
            {
              id: fromFlatCommunicationIdentifier(USER_ID),
              displayName: DISPLAY_NAME,
            },
          ],
        }
      );
      setThreadId(chatThread?.id ?? '');
    })();
  }, []);

  // For the quickstart, generate a random group ID.
  // The group Id must be a UUID.
  const groupId = useRef(uuidv4());

  return {
    endpointUrl: ENDPOINT_URL,
    userId: USER_ID,
    token: TOKEN,
    displayName: DISPLAY_NAME,
    groupId: groupId.current,
    threadId,
  };
}

export default App;

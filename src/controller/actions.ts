// const ACTIONS_API_URL = '/api/actions';

// interface ActionApiResponse<T> {
//   folderPath?: T;
//   canceled?: boolean;
//   error?: string;
// }

// async function actionApiRequest<T>(methodName: string): Promise<ActionApiResponse<T>> {
//   try {
//     const response = await fetch(ACTIONS_API_URL, {
//       method: 'POST',
//       headers: {
//         'x-method-name': methodName,
//         'Content-Type': 'application/json'
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`Network response was not ok. Status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Action API request failed:', error);
//     return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
//   }
// }

// export async function exploreFileView(): Promise<ActionApiResponse<string>> {
//   return actionApiRequest<string>('exploreFileView');
// }

// export default {
//   exploreFileView
// };
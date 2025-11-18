
// import { PageLayout } from "./components/layout";
import React from 'react';
import AppRoutes from './routes/AppRoutes';

// export default function App() {
//   return (
//     <PageLayout>
//       <div className="ml-64 mt-16 mb-8 p-6"> {/* margin-left = sidebar, margin-top = header, margin-bottom = footer */}
//         <h1 className="text-2xl font-semibold text-gray-800">Trang chính</h1>
//         <p className="mt-2 text-gray-600">Nội dung demo ở đây...</p>
//       </div>
//     </PageLayout>
//   );
// }

export default function App() {
  return <AppRoutes />;
}

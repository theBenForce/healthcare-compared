import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { WithDB } from './providers/db.tsx'
import CssBaseline from '@mui/material/CssBaseline';
import { WithAppContext } from './providers/state.tsx';
import { WithPlans } from './providers/plans.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WithAppContext>
      <CssBaseline>
        <WithDB>
          <WithPlans>
            <App />
          </WithPlans>
        </WithDB>
      </CssBaseline>
    </WithAppContext>
  </React.StrictMode>,
)

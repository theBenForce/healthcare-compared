import { Card, CardActions, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';

import { useTable } from '../../hooks/table';
import { TableNames } from '../../providers/db';
import { ExpenseSchema } from '../../types/expense.dto';
import { EditExpenseDialog } from '../../components/dialog/editExpense';
import EditIcon from '@mui/icons-material/EditRounded';


export const ExpenseList: React.FC<{ personId: string }> = ({ personId }) => {
  const { values } = useTable<ExpenseSchema>({ tableName: TableNames.EXPENSES, filter: { field: 'personId', value: personId! } });
  const [selectedExpense, setSelectedExpense] = React.useState<string | null>(null);

  return <>
    <Typography variant="h6">Expenses</Typography>
    <Stack spacing={2}>
      {values.map(expense => {
        const totalCost = expense.months.length * expense.amount;

        return <Card key={expense.id}>
          <CardHeader title={expense.name} subheader={`Total Cost: $${totalCost.toFixed(2)}`} />
          <CardActions>
            <IconButton onClick={() => setSelectedExpense(expense.id)}>
              <EditIcon />
            </IconButton>
          </CardActions>
        </Card>;
      })}
    </Stack>

    <EditExpenseDialog expenseId={selectedExpense} onClose={() => setSelectedExpense(null)} />
  </>
};
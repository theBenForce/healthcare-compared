import React from 'react';

import Dialog from '@mui/material/Dialog';
import { useTable } from '../../hooks/table';
import { ExpenseSchema } from '../../types/expense.dto';
import { DollarField } from '../DollarField';
import { EntitySelector } from '../EntitySelector';
import { MonthSelector } from '../MonthSelector';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { Logger } from '../../util/logger';


interface EditExpenseDialogProps {
  expenseId?: string | null;
  personId?: string;
  categoryId?: string;
  onClose: () => void;
}

export const EditExpenseDialog: React.FC<EditExpenseDialogProps> = ({ expenseId, onClose, personId, categoryId }) => {
  const [expense, setExpense] = React.useState<ExpenseSchema | null>(null);
  const { save, get } = useTable<ExpenseSchema>({ tableName: 'expense' });

  React.useEffect(() => {
    if (!expenseId) return;

    get(expenseId).then(setExpense);
  }, [expenseId, setExpense, get]);

  if (!expenseId) return null;

  if (!expense) return <Dialog open={Boolean(expenseId)} onClose={onClose} maxWidth='md' fullWidth>
    <DialogTitle>Loading...</DialogTitle>
    <DialogContent><LinearProgress /></DialogContent>
  </Dialog>;

  const onSave = async () => {
    Logger.info(`Saving expense`, expense);
    await save(expense);
    onClose();
  };

  const onMonthsChanged = (months: number[]) => {
    Logger.info(`Months changed`, months);
    setExpense(expense => ({ ...expense!, months }));
  };

  return <Dialog open={Boolean(expense)} onClose={onClose} maxWidth='md' fullWidth>
    <DialogTitle>{expense?.name ?? 'Expense'}</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ my: 2 }}>
        <TextField label="Name" value={expense?.name} onChange={(event) => setExpense(value => ({ ...value!, name: event.target.value }))} />

        {!categoryId && <EntitySelector label="Category" value={expense?.categoryId ?? null} onChange={(categoryId) => setExpense(value => ({ ...value!, categoryId: categoryId ?? '' }))} table='category' />}
        {!personId && <EntitySelector label="Person" value={expense?.personId ?? null} onChange={(personId) => setExpense(value => ({ ...value!, personId: personId ?? '' }))} table='person' />}
        <DollarField
          label="Monthly Amount"
          value={expense?.amount}
          onChange={(amount) => setExpense(value => ({ ...value!, amount }))}
        />
        <MonthSelector value={expense.months} onChange={onMonthsChanged} />
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onSave} variant='contained'>Save</Button>
    </DialogActions>
  </Dialog>;
};
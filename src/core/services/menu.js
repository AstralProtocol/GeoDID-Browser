import DashboardIcon from '@material-ui/icons/Dashboard';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';

export const defaultMenuData = [
  {
    title: 'Browse',
    key: 'browse',
    url: '/browse',
    icon: DashboardIcon,
  },
];

export const loggedInMenuData = [
  {
    title: 'Dashboard',
    key: 'dasboard',
    url: '/dashboard',
    icon: DashboardIcon,
  },
  {
    title: 'Create',
    key: 'create',
    url: '/create',
    icon: NoteAddIcon,
  },
  {
    title: 'Account',
    key: 'account',
    url: '/account',
    icon: AccountBalanceWalletIcon,
  },
];

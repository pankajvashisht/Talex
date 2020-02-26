/*
Menu Types:
"menu-default", "menu-sub-hidden", "menu-hidden"
*/
export const defaultMenuType = 'menu-sub-hidden';

export const subHiddenBreakpoint = 1440;
export const menuHiddenBreakpoint = 768;
export const defaultLocale = 'en';
export const localeOptions = [
	{ id: 'en', name: 'English - LTR', direction: 'ltr' },
	{ id: 'es', name: 'Español', direction: 'ltr' },
	{ id: 'enrtl', name: 'English - RTL', direction: 'rtl' }
];

export const firebaseConfig = {
	apiKey: 'AIzaSyBBksq-Asxq2M4Ot-75X19IyrEYJqNBPcg',
	authDomain: 'gogo-react-login.firebaseapp.com',
	databaseURL: 'https://gogo-react-login.firebaseio.com',
	projectId: 'gogo-react-login',
	storageBucket: 'gogo-react-login.appspot.com',
	messagingSenderId: '216495999563'
};
export const infoKey = 'LoginUser';
export const searchPath = '/app/pages/search';
export const servicePath = 'https://api.coloredstrategies.com';
export const apiUrl = () => {
	const { location } = window;
	if (location.hostname === 'localhost') {
		return `http://localhost:3000/admins`;
	} else {
		return `${location.origin}/admins`;
	}
};

/*
Color Options:
"light.purple", "light.blue", "light.green", "light.orange", "light.red", "dark.purple", "dark.blue", "dark.green", "dark.orange", "dark.red"
*/
export const themeColorStorageKey = '__theme_color';
export const isMultiColorActive = false;
export const defaultColor = 'dark.orange';
export const isDarkSwitchActive = false;
export const defaultDirection = 'ltr';
export const themeRadiusStorageKey = '__theme_radius';
export const isDemo = true;

export const convertDate = (timestamp) => {
	let date = new Date(timestamp * 1000);
	return `${date.getFullYear()} - ${date.getMonth()} - ${date.getDay()}`;
};

const data = [
	{
		id: 'dashboards',
		icon: 'iconsminds-shop-4',
		label: 'Dashboards',
		to: '/'
	},
	{
		id: 'Users',
		icon: 'simple-icon-people',
		label: 'Users',
		to: '/users',
		subs: [
			{
				icon: 'simple-icon-user',
				label: 'Users',
				to: '/users'
			},
			{
				icon: 'iconsminds-add-user',
				label: 'Add User',
				to: '/add-user'
			},
		]
	},
	{
		id: 'Shops',
		icon: 'iconsminds-shop-2',
		label: 'Shops',
		to: '/shops',
		subs: [
			{
				icon: 'iconsminds-shop',
				label: 'Shops',
				to: '/shops'
			},
			{
				icon: 'iconsminds-add-basket',
				label: 'Add Shop',
				to: '/add-shop'
			},
		]
	},
	{
		id: 'Driver',
		icon: 'iconsminds-scooter',
		label: 'Drivers',
		to: '/drivers',
		subs: [
			{
				icon: 'iconsminds-scooter',
				label: 'Drivers List',
				to: '/drivers'
			},
			{
				icon: 'simple-icon-location-pin',
				label: 'Map View',
				to: '/maps-drivers'
			},
			{
				icon: 'iconsminds-add',
				label: 'Add Driver',
				to: '/add-driver'
			},
		]
	},
	{
		id: 'Orders',
		icon: 'simple-icon-emotsmile',
		label: 'Orders',
		to: '/orders',
		subs: [
			{
				icon: 'simple-icon-emotsmile',
				label: 'Orders',
				to: '/orders'
			}
		]
	},
	{
		id: 'App Informations',
		icon: 'iconsminds-monitor---phone',
		label: 'App Informations',
		to: '/app-information'
	},

];
export default data;

import {DataStore} from "./DataStore";
import shortid from "shortid";
import {GameDataStore} from "./GameDataStore";

export interface IUserData
{
	wsId: string | null;
	playerGuid: string;
}

class _UserDataStore extends DataStore<IUserData>
{
	private static lsKey = "guid";

	public static Instance = new _UserDataStore({
		playerGuid: _UserDataStore.newOrReuseGuid(),
		wsId: null
	});

	private static newOrReuseGuid()
	{
		const stored = localStorage.getItem(_UserDataStore.lsKey);
		const toUse = stored ||  _UserDataStore.generateGuid();
		localStorage.setItem(_UserDataStore.lsKey, toUse);
		return toUse;
	}

	private static generateGuid()
	{
		return shortid.generate() + shortid.generate();
	}

	public initialize()
	{
		GameDataStore.initialize();
	}
}

export const UserDataStore = _UserDataStore.Instance;
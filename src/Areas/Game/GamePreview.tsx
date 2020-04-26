import React, {useEffect, useState} from "react";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/core/styles";
import {CopyToClipboard} from "react-copy-to-clipboard";
import {GameDataStore} from "../../Global/DataStore/GameDataStore";
import {GameRoster} from "./Components/GameRoster";
import {CopyGameLink} from "../../UI/CopyGameLink";
import Divider from "@material-ui/core/Divider";
import {useDataStore} from "../../Global/Utils/HookUtils";

interface IGamePreviewProps
{
	id: string;
}

const useStyles = makeStyles({
	playersLabel: {
		marginTop: "2rem"
	},
	gameId: {
		padding: "1rem 0"
	}
});

const GamePreview: React.FC<IGamePreviewProps> = (props) =>
{
	const classes = useStyles();

	const gameData = useDataStore(GameDataStore);

	if(props.id && !gameData.game && gameData.loaded && gameData.hasConnection)
	{
		return <Typography>No Game Found</Typography>;
	}

	const playerCount = Object.keys(gameData.game?.players ?? {}).length;

	return (
		<div style={{paddingTop: "2rem"}}>
			<Typography variant={"h4"}>Game</Typography>
			<br/>
			<CopyGameLink />
			<Divider style={{margin: "3rem 0"}} />
			<Typography className={classes.playersLabel} variant={"h4"}>
				Players <span style={{fontSize: "1rem"}}>({playerCount} / 50 max)</span>
			</Typography>
			<GameRoster />
			{props.children}
		</div>
	);
};

export default GamePreview;
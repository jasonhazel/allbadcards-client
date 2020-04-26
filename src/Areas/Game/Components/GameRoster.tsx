import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {AiOutlineUserDelete} from "react-icons/all";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import React, {useEffect, useState} from "react";
import {GameDataStore} from "../../../Global/DataStore/GameDataStore";
import {ListItemSecondaryAction} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {makeStyles} from "@material-ui/styles";
import {UserDataStore} from "../../../Global/DataStore/UserDataStore";
import {Platform} from "../../../Global/Platform/platform";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import {ContainerProgress} from "../../../UI/ContainerProgress";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles({
	iconButton: {
		minWidth: 0,
		fontSize: "1.5rem",
	},
});

export const GameRoster = () =>
{
	const classes = useStyles();
	const [gameData, setGameData] = useState(GameDataStore.state);
	const [userData, setUserData] = useState(UserDataStore.state);

	useEffect(() =>
	{
		GameDataStore.listen(setGameData);
		UserDataStore.listen(setUserData);
	}, []);

	if (!gameData.game || !gameData.loaded || !gameData.hasConnection)
	{
		return null;
	}

	const game = gameData.game;
	const gameId = gameData.game.id;

	const onClickKick = (playerGuid: string) =>
	{
		Platform.removePlayer(gameId, playerGuid, userData.playerGuid)
			.catch(e => console.error(e));
	};

	const playerGuids = Object.keys(game.players);
	const sortedPlayerGuids = [...playerGuids].sort((a, b) => game.players[b].wins - game.players[a].wins);

	const isOwner = gameData.game?.ownerGuid === userData.playerGuid;
	const playerCount = playerGuids.length;
	const spectatorCount = Object.keys(game.spectators).length;

	return (
		<div style={{width: "75vw", maxWidth: 500}}>
			<List>
				{sortedPlayerGuids.map(pg =>
				{
					const player = game?.players[pg];
					const isSelf = pg === userData.playerGuid;

					return (
						<React.Fragment key={pg}>
							<ListItem>
								<ListItemAvatar>
									<Avatar>
										<strong>{player.wins}</strong>
									</Avatar>
								</ListItemAvatar>
								<ListItemText>
									{player.nickname}
									{player.guid === gameData.game?.ownerGuid && <>
                                        <span> (Owner)</span>
                                    </>}
								</ListItemText>

								{(isOwner || isSelf) && playerCount > 1 && (
									<ListItemSecondaryAction>
										<Tooltip title={`Remove this player`} aria-label={`Remove this player`} arrow>
											<Button size={"large"} className={classes.iconButton} onClick={() => onClickKick(player.guid)}>
												<AiOutlineUserDelete/>
											</Button>
										</Tooltip>
									</ListItemSecondaryAction>
								)}
							</ListItem>
							<Divider/>
						</React.Fragment>
					)
				})}
			</List>

			<Typography style={{margin: "1rem 0"}}>
				Spectators: {spectatorCount}
			</Typography>
		</div>
	);
};
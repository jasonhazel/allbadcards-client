import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../../Global/DataStore/UserDataStore";
import {Typography} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import {Platform} from "../../../Global/Platform/platform";
import {WhiteCard} from "../../../UI/WhiteCard";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import sanitize from "sanitize-html";
import CircularProgress from "@material-ui/core/CircularProgress";
import {LoadingButton} from "../../../UI/LoadingButton";

interface IShowWinnerProps
{
}

interface DefaultProps
{
}

type Props = IShowWinnerProps & DefaultProps;
type State = IShowWinnerState;

interface IShowWinnerState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
	remaining: number;
	roundStartLoading: boolean;
}

export class ShowWinner extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			gameData: GameDataStore.state,
			userData: UserDataStore.state,
			remaining: 100,
			roundStartLoading: false
		};
	}

	public componentDidMount(): void
	{
		GameDataStore.listen(data => this.setState({
			gameData: data
		}));

		UserDataStore.listen(data => this.setState({
			userData: data
		}));

		const startTime = Date.now();
		const animate = () =>
		{
			const now = Date.now();
			const diff = now - startTime;
			const remaining = (1 - Math.min(1, diff / 3000)) * 100;
			this.setState({
				remaining: Math.floor(remaining)
			});

			if (remaining > 0)
			{
				requestAnimationFrame(animate);
			}
		};

		animate();
	}

	private roundStartClick = () =>
	{
		if (this.state.gameData.game?.id)
		{
			this.setState({
				roundStartLoading: true
			});

			Platform.nextRound(this.state.gameData.game.id, this.state.userData.playerGuid)
				.catch(e => console.error(e))
				.finally(() => this.setState({
					roundStartLoading: false
				}));
		}
	};

	public render()
	{
		const game = this.state.gameData.game;
		const lastWinner = game?.lastWinner;
		const winnerCardIds = lastWinner?.whiteCardIds ?? [];
		const winnerCards = winnerCardIds.map(cardId => this.state.gameData.roundCardDefs?.[cardId]);
		if (!lastWinner || !game || winnerCards.length === 0)
		{
			return null;
		}

		const playerGuids = Object.keys(game.players);

		const isChooser = game.chooserGuid === this.state.userData.playerGuid;

		const winner = game.players[lastWinner.playerGuid];

		const sortedPlayerGuids = [...playerGuids].sort((a, b) => game.players[b].wins - game.players[a].wins);

		return (
			<>
				<Grid item xs={12} sm={6}>
					<WhiteCard style={{marginBottom: "0.5rem"}}>
						{winnerCards.map(card => card && (
							<>
								<div dangerouslySetInnerHTML={{__html: sanitize(card)}}/>
								<Divider/>
							</>
						))}
					</WhiteCard>
				</Grid>
				<Grid item xs={12} sm={12}>
					{isChooser && (
						<div style={{marginBottom: "2rem", textAlign: "center"}}>
							<LoadingButton
								loading={this.state.roundStartLoading}
								startIcon={
									this.state.remaining > 0 && <CircularProgress
										variant={"determinate"}
										value={this.state.remaining}
										size={20}
									/>
								}
								size={"large"}
								color={"primary"}
								variant={"contained"}
								onClick={this.roundStartClick}
								disabled={this.state.remaining > 0}
							>
								Start Next round
							</LoadingButton>
						</div>
					)}
					<Divider style={{margin: "1rem 0"}}/>
					<Typography variant={"h4"}>
						Winner: {winner?.nickname}!
					</Typography>
					<div style={{marginTop: "1rem"}}>
						<Typography>Scoreboard</Typography>
						<List>
							{sortedPlayerGuids.map((pg, i) => (
								<>
									{i > 0 && i <= sortedPlayerGuids.length - 1 && (
										<Divider/>
									)}
									<ListItem>
										<ListItemAvatar>
											<Avatar>
												<strong>{game?.players[pg].wins}</strong>
											</Avatar>
										</ListItemAvatar>
										<ListItemText>
											<Typography>
												{game?.players[pg].nickname}
											</Typography>
										</ListItemText>
									</ListItem>
								</>
							))}
						</List>
					</div>
				</Grid>
			</>
		);
	}
}
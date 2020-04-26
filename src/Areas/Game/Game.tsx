import GameStart from "./GameStart";
import {RouteComponentProps, useHistory, withRouter} from "react-router";
import React from "react";
import GameJoin from "./GameJoin";
import {GameDataStore, IGameDataStorePayload} from "../../Global/DataStore/GameDataStore";
import {GamePlayWhite} from "./GamePlayWhite";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import {GamePlayBlack} from "./GamePlayBlack";
import Helmet from "react-helmet";
import {GamePlaySpectate} from "./GamePlaySpectate";
import {Typography} from "@material-ui/core";
import {ContainerProgress} from "../../UI/ContainerProgress";
import {LoadingButton} from "../../UI/LoadingButton";
import {Support} from "./Components/Support";
import Grid from "@material-ui/core/Grid";
import {Sponsor} from "../GameDashboard/SponsorList";
import Divider from "@material-ui/core/Divider";
import {ErrorBoundary} from "../../App/ErrorBoundary";
import CardContent from "@material-ui/core/CardContent";

interface IGameParams
{
	id: string;
}

interface IGameState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
	restartLoading: boolean;
	restartDelayed: boolean;
}

class Game extends React.Component<RouteComponentProps<IGameParams>, IGameState>
{
	private delayTimeout = 0;

	constructor(props: RouteComponentProps<IGameParams>)
	{
		super(props);

		this.state = {
			gameData: GameDataStore.state,
			userData: UserDataStore.state,
			restartLoading: false,
			restartDelayed: true,
		};
	}

	public componentDidMount(): void
	{
		GameDataStore.hydrate(this.props.match.params.id);

		GameDataStore.listen(data => this.setState({
			gameData: data
		}));

		UserDataStore.listen(data => this.setState({
			userData: data
		}));
	}

	private getWinnerFromState(state: IGameState)
	{
		const {
			players,
			settings
		} = state.gameData.game ?? {};

		const playerGuids = Object.keys(players ?? {});
		const winnerGuid = playerGuids.find(pg => (players?.[pg].wins ?? 0) >= (settings?.roundsToWin ?? 99));
		return winnerGuid;
	}

	public componentDidUpdate(prevProps: Readonly<RouteComponentProps<IGameParams>>, prevState: Readonly<IGameState>, snapshot?: any): void
	{
		const hadWinner = this.getWinnerFromState(prevState);
		const hasWinner = this.getWinnerFromState(this.state);
		if(!hadWinner && hasWinner && this.delayTimeout === 0)
		{
			this.delayTimeout = window.setTimeout(() => {
				this.setState({
					restartDelayed: false
				});
			}, 7000);
		}
	}

	private restartClick = (playerGuid: string) =>
	{
		this.setState({
			restartLoading: true
		});

		GameDataStore.restart(playerGuid)
			.finally(() => this.setState({
				restartLoading: false
			}));
	};

	public render()
	{
		const {
			id,
		} = this.props.match.params;

		const {
			started,
			chooserGuid,
			ownerGuid,
			spectators,
			players,
			settings
		} = this.state.gameData.game ?? {};

		if (!this.state.gameData.game || !this.state.gameData.loaded || !this.state.gameData.hasConnection)
		{
			return <ContainerProgress/>;
		}

		const {
			playerGuid
		} = this.state.userData;

		const owner = players?.[ownerGuid ?? ""];
		const isOwner = ownerGuid === this.state.userData.playerGuid;
		const isChooser = playerGuid === chooserGuid;
		const amInGame = playerGuid in (players ?? {});
		const amSpectating = playerGuid in (spectators ?? {});
		const title = `${owner?.nickname}'s game`;

		const playerGuids = Object.keys(players ?? {});
		const winnerGuid = playerGuids.find(pg => (players?.[pg].wins ?? 0) >= (settings?.roundsToWin ?? 99));

		const inviteLink = (settings?.inviteLink?.length ?? 0) > 25
			? `${settings?.inviteLink?.substr(0, 25)}...`
			: settings?.inviteLink;

		return (
			<>
				<Helmet>
					<title>{title}</title>
				</Helmet>
				<div style={{minHeight: "100vh"}}>
				{!winnerGuid && settings?.inviteLink && (
					<Typography variant={"caption"}>
						Chat/Video Invite: <a href={settings.inviteLink} target={"_blank"} rel={"nofollow noreferrer"}>{inviteLink}</a>
					</Typography>
				)}
				{winnerGuid && (
					<div>
						<Typography variant={"h3"} style={{textAlign: "center"}}>Game over! {players?.[winnerGuid].nickname} is the winner.</Typography>

						<Support />

						{playerGuid === ownerGuid && (
							<div style={{
								marginTop: "7rem",
								textAlign: "center"
							}}>
								<LoadingButton loading={this.state.restartLoading || this.state.restartDelayed} variant={"contained"} color={"primary"} onClick={() => this.restartClick(playerGuid)}>
									Restart this game?
								</LoadingButton>
							</div>
						)}
					</div>
				)}
				{!winnerGuid && (
					<ErrorBoundary>
						{(!started || !(amInGame || amSpectating)) && (
							<BeforeGame gameId={id} isOwner={isOwner}/>
						)}

						{started && amInGame && !isChooser && (
							<GamePlayWhite/>
						)}

						{started && amInGame && isChooser && (
							<GamePlayBlack/>
						)}

						{started && amSpectating && (
							<GamePlaySpectate/>
						)}
					</ErrorBoundary>
				)}
				</div>
				<Grid style={{marginTop: "5rem"}}>
					<Divider style={{margin: "1rem 0"}} />
					<Sponsor sponsor={undefined} isDiamondSponsor={true}/>
				</Grid>
			</>
		);
	}
};

interface BeforeGameProps
{
	isOwner: boolean;
	gameId: string;
}

const BeforeGame: React.FC<BeforeGameProps> = (props) =>
{
	return (
		<>
			{props.isOwner && (
				<GameStart id={props.gameId}/>
			)}

			{!props.isOwner && (
				<GameJoin id={props.gameId}/>
			)}
		</>
	);
};

export default withRouter(Game);
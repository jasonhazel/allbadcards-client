import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import Grid from "@material-ui/core/Grid";
import {BlackCard} from "../../UI/BlackCard";
import Divider from "@material-ui/core/Divider";
import {Typography} from "@material-ui/core";
import {WhiteCard} from "../../UI/WhiteCard";
import {RevealWhites} from "./Components/RevealWhites";
import {ShowWinner} from "./Components/ShowWinner";
import Button from "@material-ui/core/Button";
import {PickWinner} from "./Components/PickWinner";
import Chip from "@material-ui/core/Chip";
import {AiFillCrown} from "react-icons/all";
import CircularProgress from "@material-ui/core/CircularProgress";

interface IGamePlaySpectateProps
{
}

interface DefaultProps
{
}

type Props = IGamePlaySpectateProps & DefaultProps;
type State = IGamePlaySpectateState;

interface IGamePlaySpectateState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
}

export class GamePlaySpectate extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			gameData: GameDataStore.state,
			userData: UserDataStore.state,
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
	}

	private onSelect = (winningPlayerGuid: string) =>
	{
		GameDataStore.chooseWinner(this.state.userData.playerGuid, winningPlayerGuid);
	};

	private onClickStartRound = () =>
	{
		GameDataStore.startRound(this.state.userData.playerGuid);
	};

	public render()
	{
		const {
			gameData,
			userData
		} = this.state;

		const me = gameData.game?.spectators?.[this.state.userData.playerGuid];

		const cardDefsLoaded = Object.values(gameData.game?.roundCards ?? {}).length === 0 || Object.keys(gameData.roundCardDefs).length > 0;

		if (!me || !gameData.game || !cardDefsLoaded)
		{
			return null;
		}

		const {
			players,
			chooserGuid,
			roundCards,
			roundStarted
		} = gameData.game;

		const roundCardKeys = Object.keys(roundCards ?? {});

		const remainingPlayerGuids = Object.keys(players ?? {})
			.filter(pg => !(pg in (roundCards ?? {})) && pg !== chooserGuid);
		const chooser = players?.[chooserGuid!]?.nickname;

		const remainingPlayers = remainingPlayerGuids.map(pg => players?.[pg]?.nickname);

		const revealedIndex = this.state.gameData.game?.revealIndex ?? 0;
		const timeToPick = remainingPlayers.length === 0;
		const revealMode = timeToPick && revealedIndex < roundCardKeys.length;

		const hasWinner = !!gameData.game?.lastWinner;

		return (
			<>
				<div>
					<Chip
						color={"primary"}
						icon={<AiFillCrown/>}
						label={chooser}
					/>
					{roundStarted && remainingPlayers.map(player => (
						<Chip
							style={{marginLeft: 3, marginBottom: 3}}
							avatar={<CircularProgress size={10}/>}
							label={player}
						/>
					))}
					{!hasWinner && remainingPlayers.length === 0 && (
						<Typography variant={"body1"} style={{marginTop: "0.5rem"}}>
							{`Waiting for ${players?.[chooserGuid ?? ""]?.nickname} to pick the winner.`}
						</Typography>
					)}
				</div>
				<Divider style={{margin: "1rem 0"}}/>
				<Grid container spacing={2} style={{justifyContent: "center"}}>
					{roundStarted &&
                    <Grid item xs={12} sm={6}>
                        <BlackCard>
							{gameData.blackCardDef?.text}
                        </BlackCard>
                    </Grid>
					}
					{!roundStarted && (
						<Typography>Waiting for the round to start...</Typography>
					)}
					<RevealWhites canReveal={false}/>
					<ShowWinner/>
				</Grid>
				<PickWinner
					canPick={false}
					hasWinner={hasWinner}
					revealMode={revealMode}
					timeToPick={timeToPick}
				/>
			</>
		);
	}
}
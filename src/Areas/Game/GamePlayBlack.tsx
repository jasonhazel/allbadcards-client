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
import {LoadingButton} from "../../UI/LoadingButton";

interface IGamePlayBlackProps
{
}

interface DefaultProps
{
}

type Props = IGamePlayBlackProps & DefaultProps;
type State = IGamePlayBlackState;

interface IGamePlayBlackState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
	buttonLoading: boolean;
}

export class GamePlayBlack extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			gameData: GameDataStore.state,
			userData: UserDataStore.state,
			buttonLoading: false
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
		return GameDataStore.chooseWinner(this.state.userData.playerGuid, winningPlayerGuid);
	};

	private onClickStartRound = () =>
	{
		this.setState({
			buttonLoading: true
		});

		GameDataStore.startRound(this.state.userData.playerGuid)
			.finally(() => this.setState({
				buttonLoading: false
			}));
	};

	private onClickSkipBlack = () =>
	{
		this.setState({
			buttonLoading: true
		});

		GameDataStore.skipBlack(this.state.userData.playerGuid)
			.finally(() => this.setState({
				buttonLoading: false
			}));
	};

	public render()
	{
		const {
			gameData,
			buttonLoading
		} = this.state;

		const me = gameData.game?.players?.[this.state.userData.playerGuid];

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

		const playersAreRemaining = remainingPlayerGuids.length > 0;

		const remainingPlayers = remainingPlayerGuids.map(pg => players?.[pg]?.nickname);

		const revealedIndex = this.state.gameData.game?.revealIndex ?? 0;
		const timeToPick = remainingPlayers.length === 0;
		const revealMode = timeToPick && revealedIndex < roundCardKeys.length;
		const revealFinished = revealedIndex === roundCardKeys.length;

		const waitingLabel = revealFinished && !playersAreRemaining
			? "Pick the winner"
			: timeToPick
				? `Reveal each white card...`
				: ``;

		const hasWinner = !!gameData.game?.lastWinner;

		return (
			<>
				<div>
					<Chip
						color={"primary"}
						icon={<AiFillCrown/>}
						label={"You!"}
					/>
					{roundStarted && remainingPlayers.map(player => (
						<Chip
							style={{marginLeft: 3, marginBottom: 3}}
							avatar={<CircularProgress size={10}/>}
							label={player}
						/>
					))}
					{!hasWinner && (
						<Typography variant={"body1"} style={{marginTop: "0.5rem"}}>
							{waitingLabel}
						</Typography>
					)}
				</div>
				<Divider style={{margin: "1rem 0"}}/>
				{!roundStarted && (
					<Typography style={{marginBottom: "0.5rem", textAlign: "center"}}>Read the card aloud, then click Start The Round!</Typography>
				)}
				<Grid container spacing={2} style={{justifyContent: "center"}}>
					<Grid item xs={12} sm={6}>
						<BlackCard>
							{gameData.blackCardDef?.text}
						</BlackCard>
					</Grid>
					<RevealWhites canReveal={true}/>
					<ShowWinner/>
				</Grid>
				{!roundStarted && (
					<div style={{marginTop: "1rem", textAlign: "center"}}>
						<LoadingButton loading={buttonLoading} color={"primary"} variant={"contained"} onClick={this.onClickSkipBlack}>
							Skip Card
						</LoadingButton>
						<LoadingButton loading={buttonLoading} color={"primary"} variant={"contained"} onClick={this.onClickStartRound} style={{marginLeft: "1rem"}}>
							Start the round!
						</LoadingButton>
					</div>
				)}
				<PickWinner
					canPick={true}
					hasWinner={hasWinner}
					onPickWinner={this.onSelect}
					revealMode={revealMode}
					timeToPick={timeToPick}
				/>
			</>
		);
	}
}
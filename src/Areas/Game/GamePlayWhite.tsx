import * as React from "react";
import {GameDataStore, IGameDataStorePayload} from "../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import Grid from "@material-ui/core/Grid";
import {BlackCard} from "../../UI/BlackCard";
import Divider from "@material-ui/core/Divider";
import {Typography} from "@material-ui/core";
import {RevealWhites} from "./Components/RevealWhites";
import {ShowWinner} from "./Components/ShowWinner";
import {Confirmation} from "./Components/Confirmation";
import {WhiteCardHand} from "./Components/WhiteCardHand";
import Tooltip from "@material-ui/core/Tooltip";
import {PickWinner} from "./Components/PickWinner";
import Chip from "@material-ui/core/Chip";
import {AiFillCrown} from "react-icons/all";
import CircularProgress from "@material-ui/core/CircularProgress";
import {LoadingButton} from "../../UI/LoadingButton";

interface IGamePlayWhiteProps
{
}

interface DefaultProps
{
}

type Props = IGamePlayWhiteProps & DefaultProps;
type State = IGamePlayWhiteState;

interface IGamePlayWhiteState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
	didForfeit: boolean;
	pickedCards: number[];
	canUseMyCardsSuck: boolean;
	suckButtonLoading: boolean,
	playButtonLoading: boolean,
}

export class GamePlayWhite extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			gameData: GameDataStore.state,
			userData: UserDataStore.state,
			suckButtonLoading: false,
			playButtonLoading: false,
			pickedCards: [],
			didForfeit: false,
			canUseMyCardsSuck: this.determineCanUseMyCardsSuck(GameDataStore.state.game?.roundIndex ?? 0, GameDataStore.state.game?.id)
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

	public componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void
	{
		const prevRoundIndex = prevState.gameData.game?.roundIndex;
		const currentRoundIndex = this.state.gameData.game?.roundIndex ?? 0;

		if (prevRoundIndex !== currentRoundIndex)
		{
			this.setState({
				pickedCards: [],
				didForfeit: false
			});

			const canUseMyCardsSuck = this.determineCanUseMyCardsSuck(currentRoundIndex, this.state.gameData.game?.id);

			this.setState({
				canUseMyCardsSuck
			});
		}
	}

	private determineCanUseMyCardsSuck(currentRoundIndex: number, gameId: string | undefined)
	{
		if (!gameId)
		{
			return false;
		}

		let lastUsedCardsSuckIndex = parseInt(localStorage.getItem(this.getCardsSuckLsKey(gameId)) ?? "-99");

		if (this.state?.gameData?.game && (this.state.gameData?.game?.roundIndex ?? 0 < lastUsedCardsSuckIndex))
		{
			lastUsedCardsSuckIndex = 0;
			this.setCardsSuckUsedRound(gameId, 0);
		}

		const diff = currentRoundIndex - lastUsedCardsSuckIndex;

		return diff >= 5;
	}

	private onCommit = () =>
	{
		const hasSelected = this.state.userData.playerGuid in (this.state.gameData.game?.roundCards ?? {});
		if (hasSelected)
		{
			return;
		}

		this.setState({
			playButtonLoading: true
		});

		GameDataStore.playWhiteCards(this.state.pickedCards, this.state.userData.playerGuid)
			.finally(() => this.setState({
				playButtonLoading: false
			}));
	};

	private onPickUpdate = (pickedCards: number[]) =>
	{
		this.setState({
			pickedCards
		});
	};

	private getCardsSuckLsKey(gameId: string)
	{
		return `cards-suck-last-round-index:${gameId}`;
	}

	private setCardsSuckUsedRound(gameId: string, roundIndex?: number)
	{
		localStorage.setItem(this.getCardsSuckLsKey(gameId), String(roundIndex ?? 0));
	}

	private onForfeit = () =>
	{
		const didConfirm = confirm("" +
			"You could still win this round, but we'll automatically play a random selection from your hand, then give you new cards. " +
			"Do you really want to do that?");
		if (didConfirm)
		{
			this.setState({
				didForfeit: true,
				suckButtonLoading: true
			});

			const gameId = this.state.gameData.game?.id;

			if (gameId)
			{
				this.setCardsSuckUsedRound(gameId, this.state.gameData.game?.roundIndex);
			}

			let targetPicked = this.state.gameData.blackCardDef?.pick ?? 1;
			GameDataStore.forfeit(this.state.userData.playerGuid, targetPicked)
				.finally(() => this.setState({
					suckButtonLoading: false
				}));
		}
	};

	public render()
	{
		const {
			userData,
			gameData,
			canUseMyCardsSuck,
			didForfeit,
			pickedCards,
			playButtonLoading,
			suckButtonLoading
		} = this.state;

		if (!gameData.game)
		{
			return null;
		}

		const {
			players,
			roundCards,
			chooserGuid,
			roundStarted
		} = gameData.game;

		const remainingPlayerGuids = Object.keys(players ?? {})
			.filter(pg => !(pg in (roundCards ?? {})) && pg !== chooserGuid);

		const remainingPlayers = remainingPlayerGuids.map(pg => players?.[pg]?.nickname);
		const chooser = players?.[chooserGuid!]?.nickname;

		const hasPlayed = userData.playerGuid in roundCards;
		const hasWinner = !!gameData.game?.lastWinner;

		let targetPicked = gameData.blackCardDef?.pick ?? 1;

		const roundCardKeys = Object.keys(roundCards ?? {});
		const revealedIndex = this.state.gameData.game?.revealIndex ?? 0;
		const metPickTarget = targetPicked <= pickedCards.length;
		const timeToPick = remainingPlayers.length === 0;
		const revealMode = timeToPick && revealedIndex < roundCardKeys.length;

		return (
			<div style={{paddingBottom: "4rem"}}>
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
				<Divider style={{margin: "1rem 0"}}/>
				{!hasWinner && roundStarted && !revealMode && (
					<Grid container spacing={2}>
						<WhiteCardHand
							gameData={gameData}
							userData={userData}
							targetPicked={targetPicked}
							onPickUpdate={this.onPickUpdate}
						/>

						{!hasPlayed && !didForfeit && !revealMode && (
							<Grid item xs={12} style={{display: "flex", justifyContent: "center", padding: "4rem 0 2rem"}}>
								<Tooltip enterTouchDelay={0} enterDelay={0} title={canUseMyCardsSuck ? "Forfeit round and get new cards?" : "You can only do this every 5 rounds"} arrow>
									<div>
										<LoadingButton
											loading={suckButtonLoading}
											size={"large"}
											variant={"contained"}
											color={"primary"}
											disabled={hasPlayed || revealMode || !roundStarted || !canUseMyCardsSuck}
											onClick={this.onForfeit}
											style={{
												marginLeft: "0.5rem"
											}}
										>
											My cards suck
										</LoadingButton>
									</div>
								</Tooltip>
							</Grid>
						)}
					</Grid>
				)}

				<PickWinner
					canPick={false}
					hasWinner={hasWinner}
					revealMode={revealMode}
					timeToPick={timeToPick}
				/>

				{!hasPlayed && !didForfeit && !revealMode && metPickTarget && (
					<Confirmation>
						<LoadingButton
							loading={playButtonLoading}
							size={"large"}
							variant={"contained"}
							color={"primary"}
							onClick={this.onCommit}
						>
							Play
						</LoadingButton>
					</Confirmation>
				)}
			</div>
		);
	}
}
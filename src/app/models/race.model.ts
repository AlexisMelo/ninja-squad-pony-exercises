import { PonyModel, PonyWithPositionModel } from './pony.model';

export type RaceStatus = 'PENDING' | 'RUNNING' | 'FINISHED';

export interface RaceModel {
  id: number;
  name: string;
  ponies: Array<PonyModel>;
  startInstant: string;
  betPonyId?: number;
  status?: RaceStatus;
}

export interface LiveRaceModel {
  ponies: Array<PonyWithPositionModel>;
  status: RaceStatus;
}

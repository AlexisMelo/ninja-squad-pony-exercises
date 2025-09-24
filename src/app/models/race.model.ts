import { PonyModel, PonyWithPositionModel } from './pony.model';

type Status = 'PENDING' | 'RUNNING' | 'FINISHED';

export interface RaceModel {
  id: number;
  name: string;
  ponies: Array<PonyModel>;
  startInstant: string;
  betPonyId?: number;
  status?: Status;
}

export interface LiveRaceModel {
  ponies: Array<PonyWithPositionModel>;
  status: Status;
}

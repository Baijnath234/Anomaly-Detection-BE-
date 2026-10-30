import { Injectable, BadRequestException } from '@nestjs/common';
import { IDetector } from './detector.interface';
import { ZScoreDetector } from './zscore.detector';
import { IsolationForestDetector } from './isolation-forest.detector';
import { LofDetector } from './lof.detector';
import { OcsvmLiteDetector } from './ocsvm-lite.detector';
import { AutoencoderDetector } from './autoencoder.detector';
import { LstmAutoencoderDetector } from './lstm-autoencoder.detector';
import { EnsembleDetector } from './ensemble.detector';

@Injectable()
export class DetectorFactory {
  create(method: string): IDetector {
    const normalized = (method || '').toLowerCase().trim();
    switch (normalized) {
      case 'zscore':
      case 'z_score':
        return new ZScoreDetector();

      case 'isolation_forest':
      case 'iforest':
        return new IsolationForestDetector();

      case 'lof':
      case 'local_outlier_factor':
        return new LofDetector();

      case 'ocsvm':
      case 'ocsvm_lite':
      case 'one_class_svm':
        return new OcsvmLiteDetector();

      case 'autoencoder':
      case 'ae':
        return new AutoencoderDetector();

      case 'lstm_ae':
      case 'lstm_autoencoder':
        return new LstmAutoencoderDetector();

      case 'ensemble':
        return new EnsembleDetector();

      default:
        throw new BadRequestException(
          `Unknown detector method '${method}'. Available methods: zscore, isolation_forest, lof, ocsvm, autoencoder, lstm_ae, ensemble`,
        );
    }
  }
}


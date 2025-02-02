import type { Signer } from '../types/signer.js';
import type { HooksWriteDescriptor, HooksWriteMessage } from '../types/hooks-types.js';

import { getCurrentTimeInHighPrecision } from '../utils/time.js';
import { removeUndefinedProperties } from '../utils/object.js';

import { DwnInterfaceName, DwnMethodName, Message } from '../core/message.js';

/**
 * Input to `HookssWrite.create()`.
 */
export type HooksWriteOptions = {
  messageTimestamp?: string,
  /**
   * leave as `undefined` for customer handler.
   * ie. DWN processing will use `undefined` check to attempt to invoke the registered handler.
   */
  uri?: string,
  filter: {
    method: string,
  },
  authorizationSigner: Signer;
};

/**
 * Class that provides `HooksWrite` related operations.
 */
export class HooksWrite extends Message<HooksWriteMessage> {

  /**
   * Creates a HooksWrite message
   */
  static async create(options: HooksWriteOptions): Promise<HooksWrite> {
    const descriptor: HooksWriteDescriptor = {
      interface        : DwnInterfaceName.Hooks,
      method           : DwnMethodName.Write,
      messageTimestamp : options.messageTimestamp ?? getCurrentTimeInHighPrecision(),
      uri              : options.uri,
      filter           : options.filter
    };

    // delete all descriptor properties that are `undefined` else the code will encounter the following IPLD issue when attempting to generate CID:
    // Error: `undefined` is not supported by the IPLD Data Model and cannot be encoded
    removeUndefinedProperties(descriptor);

    const authorization = await Message.signAsAuthorization(descriptor, options.authorizationSigner);
    const message = { descriptor, authorization };

    Message.validateJsonSchema(message);

    const hooksWrite = new HooksWrite(message);
    return hooksWrite;
  }
}

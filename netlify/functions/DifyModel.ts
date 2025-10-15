// netlify/functions/DifyModel.ts
import BaseModel from './BaseModel';

/**
 * 调用 Dify「聊天助手」类型的应用
 * 官方文档：https://docs.dify.ai/getting-started/install-self-hosted
 * 接口地址：https://api.dify.ai/v1/chat-messages
 */
export default class DifyModel extends BaseModel {
  constructor(
    requestModel: string,        // 留空字符串即可，Dify 用不到
    requestAuthorization: string // 填 Dify「应用」里的 API Key
  ) {
    // Dify 统一域名，后面拼接口路径
    super(
      requestModel,
      requestAuthorization,
      [],                         // 先传空消息，后面在 formatBody 里再拼
      'https://api.dify.ai/v1/chat-messages'
    );
  }

  /**
   * 把用户消息转成 Dify 规定的格式
   * 注意：Dify 的「query」字段就是本轮用户问题
   */
  protected formatBody(requestMessages: any) {
    // 先让基类把基本结构建好（这里其实只建了个空 body）
    super.formatBody(requestMessages);

    // 取最后一条用户消息作为 query
    const lastUserMsg =
      Array.isArray(requestMessages) && requestMessages.length
        ? requestMessages[requestMessages.length - 1].content
        : '';

    this.body = {
      inputs: {},              // 如果你在 Dify 应用里定义了输入变量，就塞这里
      query: lastUserMsg,
      response_mode: 'blocking', // blocking 表示同步等待，一行结果；也可改成 streaming
      conversation_id: '',     // 第一次填空，后面可以把 Dify 返回的 id 带回来做多轮
      user: 'anonymous',       // 用户标识，可随意
    };
  }

  /**
   * Dify blocking 模式返回结构：
   * {
   *   "answer": "机器人回复",
   *   "conversation_id": "xxx",
   *   "message_id": "yyy"
   * }
   */
  handleResponse(responseData: any): string {
    if (responseData?.answer) {
      return responseData.answer;
    }
    if (responseData?.error) {
      return `Dify: ${responseData.error.message || '未知错误'}`;
    }
    return 'Dify: 无法解析响应数据';
  }
}

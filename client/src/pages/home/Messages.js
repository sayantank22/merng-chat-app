import React, { useEffect, Fragment, useState } from 'react';
import { Col, Form } from 'react-bootstrap';
import { gql, useLazyQuery, useMutation } from '@apollo/client';

import { useMessageDispatch, useMessageState } from '../../context/message';
import Message from './Message';

const GET_MESSAGES = gql`
  query getMessages($from: String!) {
    getMessages(from: $from) {
      uuid
      from
      to
      content
      createdAt
      reactions {
        uuid
        content
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation sendMessage($to: String!, $content: String!) {
    sendMessage(to: $to, content: $content) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

export default function Messages() {
  const dispatch = useMessageDispatch();
  const { users } = useMessageState();
  const [content, setContent] = useState('');

  const selectedUser = users?.find((user) => user.selected === true);
  const messages = selectedUser?.messages;

  const [
    getMessages,
    { loading: messagesLoading, data: messagesData },
  ] = useLazyQuery(GET_MESSAGES);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError(err) {
      console.log(err);
    },
  });

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.username } });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (messagesData) {
      dispatch({
        type: 'SET_USER_MESSAGES',
        payload: {
          username: selectedUser.username,
          messages: messagesData.getMessages,
        },
      });
    }
  }, [messagesData]);

  const submitMessage = (e) => {
    e.preventDefault();

    if (content.trim() === '' || !selectedUser) return;

    setContent('');

    sendMessage({ variables: { to: selectedUser.username, content } });
  };

  let selectedChartMarkup;
  if (!messages && !messagesLoading) {
    selectedChartMarkup = <p className='info-text'>Select a friend</p>;
  } else if (messagesLoading) {
    selectedChartMarkup = <p className='info-text'>Loading...</p>;
  } else if (messages.length > 0) {
    selectedChartMarkup = messages.map((message, index) => (
      <Fragment key={message.uuid}>
        <Message message={message} />
        {index === messages.length - 1 && (
          <div className='invisible'>
            <hr className='mr-0' />
          </div>
        )}
      </Fragment>
    ));
  } else if (messages.length === 0) {
    selectedChartMarkup = (
      <p className='info-text'>
        You are now connected! Send your first message
      </p>
    );
  }

  return (
    <Col xs={10} md={8} className='p-0'>
      <div className='messages-box d-flex flex-column-reverse p-3'>
        {selectedChartMarkup}
      </div>
      <div className='px-3 py-2'>
        <Form onSubmit={submitMessage}>
          <Form.Group className='d-flex align-items-center m-0'>
            <Form.Control
              type='text'
              className='message-input rounded-pill p-4 bg-secondary border-0'
              placeholder='Type a message..'
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <i
              className='fas fa-paper-plane fa-2x text-primary ml-2'
              onClick={submitMessage}
              role='button'
            />
          </Form.Group>
        </Form>
      </div>
    </Col>
  );
}

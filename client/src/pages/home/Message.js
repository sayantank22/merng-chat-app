import React, { useState } from 'react';
import classnames from 'classnames';
import { OverlayTrigger, Tooltip, Button, Popover } from 'react-bootstrap';
import moment from 'moment';

import { useAuthState } from '../../context/auth';
import { gql, useMutation } from '@apollo/client';

const reactions = ['❤️', '😆', '😯', '😢', '😡', '👍', '👎'];

const REACT_TO_MESSAGE = gql`
  mutation reactToMessage($uuid: String!, $content: String!) {
    reactToMessage(uuid: $uuid, content: $content) {
      uuid
    }
  }
`;

export default function Message({ message }) {
  const { user } = useAuthState();
  const sent = message.from === user.username;
  const recieved = !sent;
  const [showPopover, setShowPopover] = useState(false);
  const reactionIcons = [
    ...new Set(message.reactions.map((reaction) => reaction.content)),
  ];

  const [reactToMessage] = useMutation(REACT_TO_MESSAGE, {
    onError: (err) => console.log(err),
    onCompleted: (data) => setShowPopover(false),
  });

  const react = (reaction) => {
    reactToMessage({ variables: { uuid: message.uuid, content: reaction } });
  };

  const reactButton = (
    <OverlayTrigger
      trigger='click'
      placement='top'
      show={showPopover}
      onToggle={setShowPopover}
      transition={false}
      rootClose
      overlay={
        <Popover className='rounded-pill'>
          <Popover.Content className='d-flex px-0 py-1 align-items-center react-button-popover'>
            {reactions.map((reaction) => (
              <Button
                className='react-icon-button'
                variant='link'
                key={reaction}
                onClick={() => react(reaction)}>
                {reaction}
              </Button>
            ))}
          </Popover.Content>
        </Popover>
      }>
      <Button variant='link' className='px-2'>
        <i className='far fa-smile'></i>
      </Button>
    </OverlayTrigger>
  );

  return (
    <div
      className={classnames('d-flex my-3', {
        'ml-auto': sent,
        'mr-auto': recieved,
      })}>
      {sent && reactButton}
      <OverlayTrigger
        // placement={sent ? 'right' : 'left'}
        placement={sent ? 'left' : 'right'}
        transition={false}
        overlay={
          <Tooltip>
            {moment(user.createdAt).format('MMM DD, YYYY @ h:mm a')}
          </Tooltip>
        }>
        <div
          className={classnames('py-2 px-3 rounded-pill position-relative', {
            'bg-primary': sent,
            'bg-secondary': recieved,
          })}>
          {message.reactions.length > 0 && (
            <div className='reactions-div bg-secondary p-1 rounded-pill'>
              {reactionIcons} {message.reactions.length}
            </div>
          )}
          <p className={classnames({ 'text-white': sent })}>
            {message.content}
          </p>
        </div>
      </OverlayTrigger>
      {recieved && reactButton}
    </div>
  );
}

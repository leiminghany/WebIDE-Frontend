import React, { Component } from 'react';

import './card.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import config from '../../../utils/config';
import { getCreatedTime, getModifiedTime, getDeletedTime } from '../../../utils/date';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class Card extends Component {
    render() {
        const { hasWSOpend, globalKey, ownerGlobalKey, spaceKey, ownerName, projectName } = this.props;
        const { createDate, deleteTime, lastModifiedDate, workingStatus, collaborative } = this.props;
        const stopOption = {
            message: i18n('ws.stopNotice'),
            isWarn: true,
            ccText: i18n('global.cancel'),
            okText: i18n('global.stop'),
            opText: i18n('global.stoping'),
            okHandle: this.handleStop,
        }
        const deleteOption = {
            message: i18n('ws.deleteNotice'),
            isWarn: true,
            ccText: i18n('global.cancel'),
            okText: i18n('global.delete'),
            opText: i18n('global.deleting'),
            okHandle: this.handleDelete,
        }
        const restoreOption = {
            message: i18n('ws.restoreNotice'),
            isWarn: false,
            ccText: i18n('global.cancel'),
            okText: i18n('global.restore'),
            opText: i18n('global.restoring'),
            okHandle: this.handleRestore,
        }
        const invalid = workingStatus === 'Invalid';
        const canotOpen = hasWSOpend && workingStatus !== 'Online';
        const title = `${ownerName}/${projectName}`;
        const attr = createDate ? `${ownerName}/${projectName}\n${getCreatedTime(createDate)}` : title;
        return (
            <Href invalid={invalid} spaceKey={spaceKey} canotOpen={canotOpen} handleMask={this.handleMask} handleStop={this.handleStop}>
                <div className="inner" title={attr}>
                    <div className="title">{title}</div>
                    <div className="desc">
                        {workingStatus !== 'Invalid' ? getModifiedTime(Date.now(), lastModifiedDate) : getDeletedTime(Date.now(), deleteTime)}
                    </div>
                    <div className="status">
                        <div className={`state${workingStatus !== 'Online' ? ' off' : ''}`}>
                            <span className="dot green"></span>
                            <span>{i18n('global.running')}</span>
                        </div>
                        <div className={`state${!collaborative ? ' off' : ''}`}>
                            <span className="dot red"></span>
                            <span>{i18n('global.collaborating')}</span>
                        </div>
                    </div>
                </div>
                {
                    workingStatus !== 'Invalid' ? (
                        <div className="control">
                            {
                                workingStatus === 'Online' && (globalKey === ownerGlobalKey) && (
                                    <div className="act" onClick={(event) => this.handleMask(stopOption, event)}>
                                        <i className="fa fa-stop-circle-o"></i>
                                        <span>{i18n('global.stop')}</span>
                                    </div>
                                )
                            }
                            <div className="act" onClick={(event) => this.handleMask(deleteOption, event)}>
                                <i className="fa fa-trash-o"></i>
                                <span>{i18n('global.delete')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="control">
                            <div className="act" onClick={(event) => this.handleMask(restoreOption, event)}>
                                <i className="fa fa-undo"></i>
                                <span>{i18n('global.restore')}</span>
                            </div>
                        </div>
                    )
                }
            </Href>
        );
    }

    handleMask = (options, event) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.showMask(options);
    }

    handleStop = (shouldOpen) => {
        const { opendSpaceKey, spaceKey, hideMask, handleFetch } = this.props;
        api.quitWorkspace(opendSpaceKey || spaceKey).then(res => {
            hideMask();
            if (res.code === 0) {
                handleFetch();
                if (shouldOpen) {
                    const url = window === window.top ? `/ws/${spaceKey}` : `${config.studioOrigin}/ws/${spaceKey}`;
                    window.open(url);
                } else {
                    notify({ message: res.msg });
                }
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    handleDelete = () => {
        const { spaceKey, hideMask, handleFetch } = this.props;
        api.deleteWorkspace(spaceKey).then(res => {
            hideMask();
            if (res.code === 0) {
                handleFetch();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    handleRestore = () => {
        const { spaceKey, hideMask, handleFetch } = this.props;
        api.restoreWorkspace(spaceKey).then(res => {
            hideMask();
            if (!res.code) {
                handleFetch();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

const Href = ({ invalid, spaceKey, canotOpen, handleMask, handleStop, children }) => {
    const url = window === window.top ? `/ws/${spaceKey}` : `${config.studioOrigin}/ws/${spaceKey}`;
    const hasWorkspaceOpendOption = {
        message: i18n('ws.hasWSOpendNotice'),
        isWarn: true,
        ccText: i18n('global.ok'),
        okText: i18n('global.stop'),
        opText: i18n('global.stoping'),
        okHandle: () => handleStop(true),
    }
    if (canotOpen) {
        return <div className="ws-card" onClick={(event) => handleMask(hasWorkspaceOpendOption, event)}>{children}</div>;
    }
    if (invalid) {
        return <div className="ws-card">{children}</div>;
    } else {
        return <a className="ws-card" href={url} target="_blank" rel="noopener noreferrer">{children}</a>;
    }
}

export default Card;

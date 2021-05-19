import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import './Home.css';

import Input from '@material-ui/core/Input';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import profilePic from '../../assets/profilePic.jpg';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { red } from '@material-ui/core/colors';
import Card from '@material-ui/core/Card';
import Header from '../../common/header/Header';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedIn: sessionStorage.getItem("access-token") == null ? false : true,
            mediaList: [],
            filterMediaList: [],
            searchText: ''
        }
    }

    componentDidMount() {
        if (sessionStorage.getItem("access-token")) {
            this.fetchDetails();
        }
    }

    /** Method to fetch data from instagram graph endpoint */
    fetchDetails = () => {
        let detailsThat = this;
        fetch(
            `https://graph.instagram.com/me/media?fields=id,caption&access_token=${sessionStorage.getItem("access-token")}`
        )
            .then(rsp => {
                if (rsp.status === 200) {
                    rsp.json().then(res => {
                        const promises = res.data.map(item =>
                            fetch(
                                `https://graph.instagram.com/${item.id}?fields=id,media_type,media_url,username,timestamp&access_token=${sessionStorage.getItem("access-token")}`
                            )
                        );
                        Promise.all(promises)
                            .then(responses => {
                                return Promise.all(
                                    responses.map(function (response) {
                                        return response.json();
                                    })
                                );
                            },
                                err => console.log(err)
                            )
                            .then(function (data) {
                                data.forEach((media, i) => {
                                    const mediaCaption = res.data[i];
                                    if (mediaCaption.caption) {
                                        media.caption = mediaCaption.caption
                                        media.hashtags = mediaCaption.caption.split(' ').filter(str => str.startsWith('#')).join(' ');
                                        media.trimmedCaption = mediaCaption.caption.replace(/(^|\s)#[a-zA-Z0-9][^\\p{L}\\p{N}\\p{P}\\p{Z}][\w-]*\b/g, '');
                                    } else {
                                        media.caption = null;
                                    }

                                    /** Adding likes and comments into each image */
                                    const count = 0 + i;
                                    media.likeCount = count;
                                    media.likeStr = count > 1 ? 'likes' : 'like';
                                    media.userLiked = false;
                                    media.comments = [];
                                    media.comment = '';

                                    /** Method to change date format to mm/dd/yyyy HH:MM:SS format */
                                    const mediaDate = new Date(media.timestamp);
                                    const formattedDt = (mediaDate.getMonth() + 1).toString().padStart(2, '0') + '/'
                                        + mediaDate.getDate().toString().padStart(2, '0') + '/'
                                        + mediaDate.getFullYear().toString().padStart(4, '0') + ' '
                                        + mediaDate.getHours().toString().padStart(2, '0') + ':'
                                        + mediaDate.getMinutes().toString().padStart(2, '0') + ':'
                                        + mediaDate.getSeconds().toString().padStart(2, '0');
                                    media.timestamp = formattedDt;
                                });
                                detailsThat.setState({ mediaList: data, filterMediaList: data });
                            },
                                err => console.log(err)
                            ).catch(err => console.log(err));
                    });
                }
            },
                err => console.log(err)
            ).catch(err => console.log(err));
    }

    /** Method to increase/ decrease like count for an image */
    favIconClickHandler = (likeIdx) => {
        let tempMediaList = this.state.filterMediaList;
        tempMediaList.forEach((mediaObj, index) => {
            if (index === likeIdx) {
                mediaObj.userLiked ? --mediaObj.likeCount : ++mediaObj.likeCount;
                mediaObj.likeCount > 1 ? mediaObj.likeStr = 'likes' : mediaObj.likeStr = 'like';
                mediaObj.userLiked = !mediaObj.userLiked;
            }
        });
        this.setState({ filterMediaList: tempMediaList });
    }

    /** to update comment  */
    inputCommentChangeHandler = (e, idx) => {
        let tempMediaList = this.state.filterMediaList;
        tempMediaList[idx].comment = e.target.value;
        this.setState({ filterMediaList: tempMediaList });
    }

    /** to redirect to Profile Page */
    myAccountHandler = () => {
        var likeCountList = [];
        var commentList = [];
        this.state.filterMediaList.forEach((media, i) => {
            likeCountList.push({
                count: media.likeCount,
                likeStr: media.likeStr,
                userLiked: media.userLiked
            })
            commentList.push(media.comments);
        });
        sessionStorage.setItem('likeCountList', JSON.stringify(likeCountList));
        sessionStorage.setItem('commentList', JSON.stringify(commentList));
        this.props.history.push('/profile');
    }
/**  to search images based to the search text entered by the user*/
searchHandler = (e) => {
    this.setState({ searchText: e.target.value }, () => {
        if (!this.state.searchText || this.state.searchText.trim() === "") {
            this.setState({ filterMediaList: this.state.mediaList });
        } else {
            let filteredMedia = this.state.mediaList.filter((media) => {
                if (media.caption) {
                    return media.caption.toUpperCase().indexOf(this.state.searchText.toUpperCase()) > -1
                }
                return false;
            });
            this.setState({ filterMediaList: filteredMedia });
        }
    });

}
    /** to add comment */
    addCommentHandler = (idx) => {
        let tempMediaList = this.state.filterMediaList;
        if (tempMediaList[idx].comment) {
            let tempComments = tempMediaList[idx].comments;
            tempComments.push({ commentStr: tempMediaList[idx].comment });
            tempMediaList[idx].comments = tempComments;
            tempMediaList[idx].comment = '';
            this.setState({ filterMediaList: tempMediaList });
        }
    }

    

    

    render() {
        if (!this.state.loggedIn) {
            return (
                <Redirect to="/" />
            )
        }
        return (
            <div>
                {/** Header component */}
                <Header loggedIn={this.state.loggedIn} homePage={true}
                    history={this.props.history} searchHandler={this.searchHandler} myAccountHandler={this.myAccountHandler} />

                {/** Image Card added here */}
                <Grid alignContent='center' container spacing={2} justify='flex-start' direction='row'
                    style={{ width: "85%", margin: "auto", paddingTop: 10}}>
                    {this.state.filterMediaList.map((media, index) => (
                        <Grid item xs={6} key={"grid_" + media.id}>
                            <Card key={"card_" + media.id} style={{ padding: '0 8px' }}>
                                <CardHeader
                                    avatar={<Avatar variant="circular" src={profilePic} />}
                                    title={media.username}
                                    subheader={media.timestamp} />
                                <CardContent>
                                    <div>
                                        <img src={media.media_url} alt={media.media_url} className="media-img" />
                                    </div>
                                    <div className="media-dtl-divider">
                                        <Divider variant="fullWidth" />
                                    </div>
                                    <div>
                                        <Typography style={{ fontSize: '15px' }}>{media.trimmedCaption}</Typography>
                                        <Typography style={{ fontSize: '15px', color: '#0ab7ff' }}>
                                            {media.hashtags}
                                        </Typography>
                                    </div>
                                    <div className="media-icon-section">
                                        {media.userLiked ?
                                            <FavoriteIcon style={{ color: red[500], fontSize: 30 }}
                                                onClick={() => this.favIconClickHandler(index)} />
                                            :
                                            <FavoriteBorderIcon style={{ fontSize: 30 }}
                                                onClick={() => this.favIconClickHandler(index)} />}
                                        <Typography style={{ paddingLeft: 15 }}>
                                            {media.likeCount + ' ' + media.likeStr}
                                        </Typography>
                                    </div>
                                    <div className="comment-section">
                                        {media.comments.length > 0 ?
                                            (media.comments.map((comment, i) => (
                                                <p key={'comment_' + index + '_' + i} style={{ margin: '0 0 10px 0' }}>
                                                    <b>{media.username}:</b> {comment.commentStr}
                                                </p>
                                            )))
                                            : ''}
                                    </div>
                                    <div>
                                        <FormControl style={{ marginRight: 10 }} className='comment-form-control'>
                                            <InputLabel htmlFor={'comment_' + index}>Add a comment</InputLabel>
                                            <Input id={'comment_' + index} type='input'
                                                value={media.comment ? media.comment : ''}
                                                onChange={(e) => this.inputCommentChangeHandler(e, index)} />
                                        </FormControl>
                                        <FormControl style={{ verticalAlign: "bottom" }}>
                                            <Button variant='contained' color='primary'
                                                onClick={() => this.addCommentHandler(index)}>
                                                ADD
                                                </Button>
                                        </FormControl>
                                    </div>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                
            </div>
        )
    }
}

export default Home;
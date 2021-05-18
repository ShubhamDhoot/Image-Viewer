import React, { Component } from 'react';
import './Header.css';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import profilePic from '../../assets/profilePic.jpg';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';

const StyledMenu = withStyles({
    paper: {
        border: '1px solid #d3d4d5',
        backgroundColor: '#DFDFDF',
        padding: "6px 15px",
        boxShadow: 'none',
        marginTop: 2
    }
})(Menu);

const StyledMenuItem = withStyles(theme => ({
    root: {
        padding: 4,
        minHeight: 'auto',
        '&:focus': {
            backgroundColor: theme.palette.grey,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: theme.palette.common.white,
            }
        }
    }
}))(MenuItem);

class Header extends Component {

    constructor(props) {
        super(props);
        this.state = {
            openMenu: false,
            anchorEl: null
        }
    }

    /**Handler to update state variable 'openMenu' and open the Menu item when the user clicks on profile icon */
    profileIconHandler = (event) => {
        this.setState({ openMenu: !this.state.openMenu, anchorEl: event.currentTarget })
    }

    /**Handler to update state variable 'openMenu' and close the Menu item when the user clicks on profile icon
     * or anywhere in the screen
     */
    closeMenu = () => {
        this.setState({ openMenu: !this.state.openMenu, anchorEl: null })
    }

    /**Handler to log out when user clicks on Logout menu item and remove access token from session */
    logoutHandler = () => {
        sessionStorage.removeItem('access-token');
        this.props.history.push('/');
    }

    /**Handler to take user back to Home page when clicked on logo */
    logoHandler = () => {
        this.props.history.push('/home');
    }

    render() {
        return (
            <div>
                <header className="app-header">
                    {this.props.loggedIn && this.props.history.location.pathname === '/profile' ?
                        <div onClick={this.logoHandler} className="app-logo-clickable">
                            <span className="app-logo">Image Viewer</span>
                        </div>
                        :
                        <div>
                            <span className="app-logo">Image Viewer</span>
                        </div>}
                    {/**Below section needs to be displayed only for Home Page */}
                    {/**Home Page Header section starts here */}
                    {this.props.loggedIn ?
                        <div className="app-header-right">
                            {this.props.homePage ?
                                <Input type="search" placeholder="Search…" disableUnderline className="search-box"
                                    startAdornment={
                                        <InputAdornment position="start" className="search-icon">
                                            <SearchIcon />
                                        </InputAdornment>
                                    } onChange={this.props.searchHandler} /> : ''}
                            <IconButton aria-controls="simple-menu" aria-haspopup="true"
                                onClick={this.profileIconHandler} style={{ padding: "5px 10px" }}>
                                <Avatar variant="circular" alt={profilePic} src={profilePic} style={{border: '1px solid white'}} ></Avatar>
                            </IconButton>
                            <StyledMenu id="simple-menu" open={this.state.openMenu} onClose={this.closeMenu}
                                anchorEl={this.state.anchorEl} getContentAnchorEl={null}
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }} keepMounted>
                                {this.props.homePage ?
                                    <StyledMenuItem onClick={this.props.myAccountHandler}>
                                        <Typography>My Account</Typography>
                                    </StyledMenuItem>
                                    : ''}
                                {this.props.homePage ?
                                    <Divider variant="middle" />
                                    : ''}
                                <StyledMenuItem onClick={this.logoutHandler}>
                                    <Typography>Logout</Typography>
                                </StyledMenuItem>
                            </StyledMenu>
                        </div>
                        : ''}
                    {/**Home Page Header section ends here */}
                </header>
            </div >
        )
    }
}

export default Header;
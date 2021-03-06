/**
 * External dependencies
 */
import React from 'react';
import { noop, get } from 'lodash';
import page from 'page';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import EllipsisMenu from 'components/ellipsis-menu';
import PopoverMenuItem from 'components/popover/menu-item';
import FeedSubscriptionStore from 'lib/reader-feed-subscriptions';
import SiteStore from 'lib/reader-site-store';
import FeedStore from 'lib/feed-store';
import FeedStoreActions from 'lib/feed-store/actions';
import SiteBlockStore from 'lib/reader-site-blocks';
import SiteBlockActions from 'lib/reader-site-blocks/actions';
import PostUtils from 'lib/posts/utils';
import FollowButton from 'reader/follow-button';
import * as DiscoverHelper from 'reader/discover/helper';
import smartSetState from 'lib/react-smart-set-state';
import * as stats from 'reader/stats';

const ReaderPostOptionsMenu = React.createClass( {

	propTypes: {
		post: React.PropTypes.object.isRequired,
		onBlock: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onBlock: noop,
			position: 'top left'
		};
	},

	smartSetState: smartSetState,

	getInitialState() {
		const state = this.getStateFromStores();
		state.popoverPosition = this.props.position;
		return state;
	},

	componentDidMount() {
		SiteBlockStore.on( 'change', this.updateState );
		FeedSubscriptionStore.on( 'change', this.updateState );
		FeedStore.on( 'change', this.updateState );
	},

	componentWillUnmount() {
		SiteBlockStore.off( 'change', this.updateState );
		FeedSubscriptionStore.off( 'change', this.updateState );
		FeedStore.off( 'change', this.updateState );
	},

	getStateFromStores() {
		const siteId = this.props.post.site_ID,
			feed = this.getFeed(),
			followUrl = this.getFollowUrl( feed );

		return {
			isBlocked: SiteBlockStore.getIsBlocked( siteId ),
			feed: this.getFeed(),
			followUrl: followUrl
		};
	},

	updateState() {
		this.smartSetState( this.getStateFromStores() );
	},

	blockSite() {
		stats.recordAction( 'blocked_blog' );
		stats.recordGaEvent( 'Clicked Block Site' );
		stats.recordTrackForPost( 'calypso_reader_block_site', this.props.post );
		SiteBlockActions.block( this.props.post.site_ID );
		this.props.onBlock();
	},

	reportPost() {
		if ( ! this.props.post || ! this.props.post.URL ) {
			return;
		}

		stats.recordAction( 'report_post' );
		stats.recordGaEvent( 'Clicked Report Post', 'post_options' );
		stats.recordTrackForPost( 'calypso_reader_post_reported', this.props.post );

		window.open( 'https://wordpress.com/abuse/?report_url=' + encodeURIComponent( this.props.post.URL ), '_blank' );
	},

	getFollowUrl( feed ) {
		return feed ? feed.get( 'feed_URL' ) : this.props.post.site_URL;
	},

	getFeed() {
		const feedId = get( this.props, 'post.feed_ID' );
		if ( ! feedId || feedId < 1 ) {
			return;
		}

		const feed = FeedStore.get( feedId );

		if ( ! feed ) {
			FeedStoreActions.fetch( feedId );
		}

		return feed;
	},

	onMenuToggle( isMenuVisible ) {
		stats.recordAction( isMenuVisible ? 'open_post_options_menu' : 'close_post_options_menu' );
		stats.recordGaEvent( isMenuVisible ? 'Open Post Options Menu' : 'Close Post Options Menu' );
		stats.recordTrackForPost( 'calypso_reader_post_options_menu_' + ( isMenuVisible ? 'opened' : 'closed' ), this.props.post );
	},

	editPost( closeMenu ) {
		const post = this.props.post,
			site = SiteStore.get( this.props.post.site_ID );
		let editUrl = '//wordpress.com/post/' + post.site_ID + '/' + post.ID + '/';

		closeMenu();

		if ( site && site.get( 'slug' ) ) {
			editUrl = PostUtils.getEditURL( post, site.toJS() );
		}

		stats.recordAction( 'edit_post' );
		stats.recordGaEvent( 'Clicked Edit Post', 'post_options' );
		stats.recordTrackForPost( 'calypso_reader_edit_post_clicked', this.props.post );

		setTimeout( function() { // give the analytics a chance to escape
			if ( editUrl.indexOf( '//' ) === 0 ) {
				window.location.href = editUrl;
			} else {
				page( editUrl );
			}
		}, 100 );
	},

	render() {
		const post = this.props.post,
			isEditPossible = PostUtils.userCan( 'edit_post', post ),
			isDiscoverPost = DiscoverHelper.isDiscoverPost( post );

		let isBlockPossible = false;

		// Should we show the 'block' option?
		if ( post.site_ID && ! post.is_external && ! post.is_jetpack && ! isEditPossible && ! isDiscoverPost ) {
			isBlockPossible = true;
		}

		const classes = classnames( 'reader-post-options-menu', this.props.className );

		return (
			<span className={ classes }>
				<EllipsisMenu
					className="reader-post-options-menu__ellipsis-menu"
					onToggle={ this.onMenuToggle }>
					<FollowButton tagName={ PopoverMenuItem } siteUrl={ this.state.followUrl } />

					{ isEditPossible ? <PopoverMenuItem onClick={ this.editPost } icon="pencil">
						{ this.translate( 'Edit Post' ) }
					</PopoverMenuItem> : null }

					{ isBlockPossible || isDiscoverPost ? <hr className="reader-post-options-menu__hr" /> : null }
					{ isBlockPossible ? <PopoverMenuItem onClick={ this.blockSite }>{ this.translate( 'Block Site' ) }</PopoverMenuItem> : null }
					{ isBlockPossible || isDiscoverPost ? <PopoverMenuItem onClick={ this.reportPost }>{ this.translate( 'Report this Post' ) }</PopoverMenuItem> : null }
				</EllipsisMenu>
			</span>
		);
	}

} );

export default ReaderPostOptionsMenu;

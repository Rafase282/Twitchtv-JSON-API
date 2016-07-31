'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TwitchApp = function (_React$Component) {
  _inherits(TwitchApp, _React$Component);

  function TwitchApp(props) {
    _classCallCheck(this, TwitchApp);

    var accList = JSON.parse(localStorage.getItem('Rafase282_TwitchApp'));

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.state = {
      streamers: accList ? accList : _this.getStreamers(),
      defaultLogo: 'https://s-media-cache-ak0.pinimg.com/236x/1b/d0/eb/1bd0eb3468a132c2f8d02a56435ebd1e.jpg',
      filteredStreamersPayloads: [],
      allStreamersPayloads: [],
      filter: null
    };
    return _this;
  }

  TwitchApp.prototype.clearLocalStorage = function clearLocalStorage(props) {
    localStorage.removeItem('Rafase282_TwitchApp');
    var streamers = this.getStreamers();
    $('#online').removeClass('active');
    $('#offline').removeClass('active');
    $('ul.tabs').tabs();
    $('ul.tabs').tabs('select_tab', 'all');
    this.getFullDataAll(streamers);
    this.setState({
      streamers: streamers,
      filteredStreamersPayloads: [],
      allStreamersPayloads: [],
      filter: null
    });
  };

  TwitchApp.prototype.componentDidUpdate = function componentDidUpdate(prevProps, nextProps) {
    localStorage.setItem('Rafase282_TwitchApp', JSON.stringify(this.state.streamers));
  };

  TwitchApp.prototype.constructPayloadForStreamer = function constructPayloadForStreamer(data) {
    var streamData = data.streamData;
    var userData = data.userData;

    var user = undefined,
        logo = undefined,
        bio = undefined,
        status = undefined,
        url = undefined,
        viewers = undefined,
        game = undefined,
        preview = undefined,
        followers = undefined,
        fps = undefined;
    var streaming = false;

    function setOffline(msg) {
      viewers = msg;
      game = msg;
      followers = msg;
      fps = msg;
    };
    user = userData.display_name || streamData.message.split("'")[1];
    logo = userData.logo ? userData.logo : this.state.defaultLogo;
    bio = userData.bio ? userData.bio : 'No Bio available.';

    if (streamData.stream == null) {
      status = 'Offline!';
      setOffline('Only Available when online.');
    };

    if (streamData.status == 404) {
      status = streamData.message;
      setOffline(streamData.message);
    };
    if (streamData.status == 422) {
      status = 'Account Closed!';
      setOffline(streamData.message);
    };

    if (streamData.stream) {
      status = streamData.stream.channel.status;
      url = streamData.stream.channel.url;
      viewers = numeral(streamData.stream.viewers).format('0,0');
      game = streamData.stream.game;
      preview = streamData.stream.preview.large;
      followers = numeral(streamData.stream.channel.followers).format('0,0');
      fps = numeral(streamData.stream.average_fps).format('0.00');
      streaming = true;
    };

    return {
      user: user,
      logo: logo,
      bio: bio,
      status: status,
      url: url,
      viewers: viewers,
      game: game,
      preview: preview,
      followers: followers,
      fps: fps,
      streaming: streaming
    };
  };

  TwitchApp.prototype.filterStreamers = function filterStreamers(event) {
    var statusFilter = this.getFilteredStreamers(this.state.filter);
    var updatedPayloadsList = statusFilter.filter(function (payload) {
      return payload.user.toLowerCase().search(event.target.value.toLowerCase()) !== -1;
    });

    this.setState({
      filteredStreamersPayloads: updatedPayloadsList
    });
  };

  TwitchApp.prototype.getFilteredStreamers = function getFilteredStreamers(status) {
    var statusFilteredList = undefined;
    if (status !== null) {
      statusFilteredList = this.state.allStreamersPayloads.filter(function (payload) {
        return payload.streaming === status;
      });
    } else {
      statusFilteredList = this.state.allStreamersPayloads;
    }
    return statusFilteredList;
  };

  TwitchApp.prototype.filterStreamerStatus = function filterStreamerStatus(status) {
    var currFilter = undefined;
    switch (status) {
      case true:
        currFilter = true;
        break;
      case false:
        currFilter = false;
        break;
      default:
        currFilter = null;
    };
    var statusFilter = this.getFilteredStreamers(status);
    this.setState({
      filter: currFilter,
      filteredStreamersPayloads: statusFilter
    });
  };

  TwitchApp.prototype.getFullDataAll = function getFullDataAll(streamers) {
    var _this2 = this;

    streamers.forEach(function (streamer) {
      _this2.getStreamerFullData(streamer);
    });
  };

  TwitchApp.prototype.getUserData = function getUserData(streamer) {
    return axios.get('https://api.twitch.tv/kraken/users/' + streamer).catch(function (error) {
      if (error.response) {
        return error.response;
      }
    });
  };

  TwitchApp.prototype.getStreamData = function getStreamData(streamer) {
    return axios.get('https://api.twitch.tv/kraken/streams/' + streamer).catch(function (error) {
      if (error.response) {
        return error.response;
      }
    });
  };

  TwitchApp.prototype.getStreamerFullData = function getStreamerFullData(streamer) {
    var _this3 = this;

    return axios.all([this.getStreamData(streamer), this.getUserData(streamer)]).then(axios.spread(function (stream, user) {
      return {
        streamData: stream.data,
        userData: user.data
      };
    })).then(function (data) {
      return _this3.constructPayloadForStreamer(data);
    }).then(function (payload) {
      _this3.setState({
        allStreamersPayloads: [].concat(_this3.state.allStreamersPayloads, [payload]),
        filteredStreamersPayloads: [].concat(_this3.state.filteredStreamersPayloads, [payload])

      });
    });
  };

  TwitchApp.prototype.addStreamers = function addStreamers(streamer) {
    this.setState({
      streamers: [].concat(this.state.streamers, [streamer])
    });
    this.getStreamerFullData(streamer);
  };

  TwitchApp.prototype.removeStreamer = function removeStreamer(streamer) {
    // Removes streamer from streamers state
    var streamers = this.state.streamers.map(function (s) {
      return s.toLowerCase();
    }).filter(function (s) {
      return s !== streamer.toLowerCase();
    });

    // Get filtered list for current view
    var statusFilter = this.getFilteredStreamers(this.state.filter);
    // Removes streamer from filtered streamer list
    var filteredStreamersPayloads = statusFilter.filter(function (payload) {
      return payload.user.toLowerCase().search(streamer.toLowerCase()) === -1;
    });

    // Removes streamer from all streamer's payload
    var allStreamersPayloads = this.state.allStreamersPayloads.filter(function (payload) {
      return payload.user.toLowerCase().indexOf(streamer.toLowerCase()) === -1;
    });

    this.setState({
      streamers: streamers,
      filteredStreamersPayloads: filteredStreamersPayloads,
      allStreamersPayloads: allStreamersPayloads
    });
  };

  TwitchApp.prototype.componentDidMount = function componentDidMount() {
    this.getFullDataAll(this.state.streamers);
    // Modal settings for bringing up edit section
    $('.modal-trigger').leanModal({
      dismissible: true, // Modal can be dismissed by clicking outside of the modal
      opacity: .5, // Opacity of modal background
      in_duration: 300, // Transition in duration
      out_duration: 200, // Transition out duration
      starting_top: '5%', // Starting top style attribute
      ending_top: '10%', // Ending top style attribute
      complete: function complete(streamer) {
        document.getElementById('chipsInput').value = '';
      } // Callback for Modal close
    });
  };

  TwitchApp.prototype.getStreamers = function getStreamers() {
    return ['freecodecamp', 'storbeck', 'terakilobyte', 'habathcx', 'RobotCaleb', 'thomasballinger', 'noobs2ninjas', 'beohoff', 'MedryBW', 'brunofin', 'comster404', 'quill18', 'rafase282', 'darkness_429', 'kairi78_officiel', 'rafase282s', 'esl_sc2', 'SchviftyFive'];
  };

  TwitchApp.prototype.render = function render() {
    return React.createElement(
      'section',
      { className: 'container-fluid' },
      React.createElement(Header, null),
      React.createElement(
        'main',
        { className: 'page-content container' },
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'div',
            { className: 'col s12' },
            React.createElement(
              'div',
              { className: 'card-panel color-Bp-light' },
              React.createElement(FilterTabs, { onClickStatus: this.filterStreamerStatus.bind(this) }),
              React.createElement(SearchBar, { filterStreamers: this.filterStreamers.bind(this) }),
              React.createElement(FilteredList, { filteredStreamersPayloads: this.state.filteredStreamersPayloads })
            )
          )
        ),
        React.createElement(Menu, { onClickReset: this.clearLocalStorage.bind(this) }),
        React.createElement(AllChips, { addChip: this.addStreamers.bind(this), chips: this.state.allStreamersPayloads, removeChip: this.removeStreamer.bind(this) })
      ),
      React.createElement(Footer, null)
    );
  };

  return TwitchApp;
}(React.Component);

;
var FilterTabs = function FilterTabs(props) {
  return React.createElement(
    'div',
    { className: 'row' },
    React.createElement(
      'div',
      { className: 'col s12' },
      React.createElement(
        'ul',
        { className: 'tabs color-Bp' },
        React.createElement(
          'li',
          { className: 'tab col s12 m4' },
          React.createElement(
            'a',
            { className: 'color-Ts', id: 'all', onClick: function onClick() {
                return props.onClickStatus(null);
              } },
            'All Streamers'
          )
        ),
        React.createElement(
          'li',
          { className: 'tab col s12 m4' },
          React.createElement(
            'a',
            { className: 'color-Ts', id: 'online', onClick: function onClick() {
                return props.onClickStatus(true);
              } },
            'Online Streamers'
          )
        ),
        React.createElement(
          'li',
          { className: 'tab col s12 m4' },
          React.createElement(
            'a',
            { className: 'color-Ts', id: 'offline', onClick: function onClick() {
                return props.onClickStatus(false);
              } },
            'Offline Streamers'
          )
        )
      )
    )
  );
};
var SearchBar = function SearchBar(props) {
  return React.createElement(
    'div',
    { className: 'row', id: 'searchBar' },
    React.createElement(
      'div',
      { className: 'input-field col s12' },
      React.createElement(
        'i',
        { className: 'material-icons prefix color-Ts' },
        'search'
      ),
      React.createElement('input', { onChange: props.filterStreamers, className: 'color-Ts center-align', id: 'search', type: 'text', name: 'search', placeholder: 'Search for streamers' })
    )
  );
};
var FilteredList = function FilteredList(props) {
  return React.createElement(
    'ul',
    { className: 'collection collapsible popout', 'data-collapsible': 'accordion' },
    props.filteredStreamersPayloads.map(function (payload, i) {
      return React.createElement(UserCard, { key: i, payload: payload });
    })
  );
};
var UserCard = function UserCard(props) {
  var _props$payload = props.payload;
  var user = _props$payload.user;
  var logo = _props$payload.logo;
  var bio = _props$payload.bio;
  var status = _props$payload.status;
  var url = _props$payload.url;
  var viewers = _props$payload.viewers;
  var game = _props$payload.game;
  var preview = _props$payload.preview;
  var followers = _props$payload.followers;
  var fps = _props$payload.fps;

  var showLink = function showLink() {
    if (url) {
      return React.createElement(
        'a',
        { href: url, target: '_blank', className: 'secondary-content' },
        React.createElement(
          'i',
          { className: 'material-icons' },
          'web'
        )
      );
    }
  };
  return React.createElement(
    'li',
    { className: 'collection-item avatar color-Bsd color-Tp' },
    React.createElement(
      'div',
      { className: 'collapsible-header' },
      React.createElement(
        'span',
        { className: 'title' },
        React.createElement('img', { src: logo, alt: user, className: 'circle' }),
        ' ',
        user,
        React.createElement(
          'p',
          null,
          React.createElement(
            'strong',
            null,
            'Title: '
          ),
          status
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'collapsible-body' },
      React.createElement(
        'p',
        null,
        React.createElement(
          'strong',
          null,
          'Bio: '
        ),
        bio,
        React.createElement('br', null),
        React.createElement(
          'strong',
          null,
          'Playing: '
        ),
        game,
        React.createElement('br', null),
        React.createElement(
          'strong',
          null,
          'Current Views: '
        ),
        viewers,
        React.createElement('br', null),
        React.createElement(
          'strong',
          null,
          'Followers: '
        ),
        followers,
        React.createElement('br', null),
        React.createElement(
          'strong',
          null,
          'Stream Average FPS: '
        ),
        fps
      ),
      React.createElement('img', { src: preview, className: 'preview responsive-img' })
    ),
    showLink()
  );
};
var AllChips = function AllChips(props) {
  var clearInput = function clearInput() {
    return document.getElementById('chipsInput').value = '';
  };
  var handleAddingChip = function handleAddingChip(event) {
    var toAdd = document.getElementById('chipsInput').value;
    if (!toAdd) {
      console.warn('Type username to add streamer!');
      return;
    } else {
      props.addChip(toAdd);
      clearInput();
    }
  };
  var handleRemovingChip = function handleRemovingChip(streamer) {
    props.removeChip(streamer);
  };
  var chips = props.chips.map(function (chip, i) {
    return React.createElement(Chip, { name: chip.user, key: i, logo: chip.logo, removeChip: handleRemovingChip.bind(undefined) });
  });
  $("#chipsInput").keyup(function (e) {
    if (e.keyCode == 13) {
      // Do something
      handleAddingChip();
    }
  });
  return React.createElement(
    'div',
    { id: 'editstreamers', className: 'modal bottom-sheet center-align' },
    React.createElement(
      'div',
      { className: 'modal-content' },
      React.createElement(
        'h4',
        { className: 'color-Tp' },
        'Edit the Streamers List'
      ),
      React.createElement(
        'p',
        { className: 'color-Tp-light' },
        'Type an username to add a new streamer or click on the ',
        React.createElement(
          'i',
          { className: 'chip-btn-icon material-icons' },
          'close'
        ),
        ' to delete an existing one.'
      ),
      React.createElement(
        'div',
        { className: 'chips' },
        chips,
        React.createElement('input', { className: 'color-Tp center-align', id: 'chipsInput', type: 'text', name: 'chipsInput', placeholder: 'Type here to add more streamers' })
      )
    ),
    React.createElement(
      'div',
      { className: 'modal-footer' },
      React.createElement(
        'button',
        { className: 'btn color-Bp', onClick: handleAddingChip.bind(undefined) },
        ' Add Streamer'
      ),
      React.createElement(
        'a',
        { className: 'modal-action modal-close waves-effect waves-green btn-flat' },
        'Close'
      )
    )
  );
};
var Chip = function Chip(props) {
  return React.createElement(
    'div',
    { className: 'chip color-Bp color-Ts-light' },
    React.createElement('img', { src: props.logo, alt: props.name }),
    props.name,
    React.createElement(
      'i',
      { className: 'chip-btn material-icons color-Tp-light', onClick: function onClick() {
          return props.removeChip(props.name);
        } },
      'close'
    )
  );
};
var Menu = function Menu(props) {
  return React.createElement(
    'div',
    { className: 'fixed-action-btn horizontal click-to-toggle',
      style: { bottom: 45, right: 24 } },
    React.createElement(
      'a',
      { className: 'btn-floating btn-large red' },
      React.createElement(
        'i',
        { className: 'material-icons' },
        'menu'
      )
    ),
    React.createElement(
      'ul',
      null,
      React.createElement(
        'li',
        null,
        React.createElement(
          'a',
          { className: 'btn-floating red modal-trigger', href: '#editstreamers' },
          React.createElement(
            'i',
            { 'data-position': 'top', 'data-tooltip': 'Edit streamers list', className: 'material-icons tooltipped' },
            'edit'
          )
        )
      ),
      React.createElement(
        'li',
        null,
        React.createElement(
          'a',
          { className: 'btn-floating yellow darken-1', onClick: props.onClickReset },
          React.createElement(
            'i',
            { 'data-position': 'top', 'data-tooltip': 'Restore Default to Users', className: 'material-icons tooltipped' },
            'settings_backup_restore'
          )
        )
      )
    )
  );
};
var Header = function Header() {
  return React.createElement(
    'header',
    { className: 'page-header center-align' },
    React.createElement(
      'nav',
      null,
      React.createElement(
        'div',
        { className: 'nav-wrapper color-Bp' },
        React.createElement(
          'a',
          { className: 'brand-logo center color-Ts' },
          'Twitch Status'
        )
      )
    )
  );
};
var Footer = function Footer() {
  return React.createElement(
    'footer',
    { className: 'page-footer center-align color-Bp' },
    React.createElement(FooterInfo, null),
    React.createElement(FooterCopyright, null)
  );
};
var FooterCopyright = function FooterCopyright() {
  return React.createElement(
    'div',
    { className: 'footer-copyright' },
    React.createElement(
      'div',
      { className: 'container center-align' },
      'Copyright ©  ',
      React.createElement(
        'a',
        { className: 'color-Ts', href: 'http://rafase282.github.io/' },
        'Rafael J. Rodriguez'
      ),
      '  2016. All Rights Reserved'
    )
  );
};
var FooterInfoButtons = function FooterInfoButtons() {
  return React.createElement(
    'div',
    { className: 'col l4 offset-l2 s12' },
    React.createElement(
      'h5',
      { className: 'color-Ts' },
      'Follow Me!'
    ),
    React.createElement(
      'div',
      { className: 'col s6' },
      React.createElement(
        'ul',
        null,
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: 'https://github.com/Rafase282', target: '_blank' },
            React.createElement('span', { 'data-position': 'left', 'data-tooltip': 'GitHub', className: 'devicons devicons-github_badge color-Ts tooltipped' })
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: 'https://www.linkedin.com/in/rafase282', target: '_blank' },
            React.createElement('i', { 'data-position': 'left', 'data-tooltip': 'LinkedIn', className: 'mdi mdi-linkedin-box small color-Ts tooltipped' })
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: 'http://codepen.io/Rafase282', target: '_blank' },
            React.createElement('span', { 'data-position': 'left', 'data-tooltip': 'Codepen', className: 'devicons devicons-codepen color-Ts tooltipped' })
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: 'https://www.youtube.com/c/rafaelrodriguez282', target: '_blank' },
            React.createElement('i', { 'data-position': 'left', 'data-tooltip': 'YouTube', className: 'mdi mdi-youtube-play small color-Ts tooltipped' })
          )
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'col s6' },
      React.createElement(
        'ul',
        null,
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: 'https://medium.com/@Rafase282', target: '_blank' },
            React.createElement('i', { 'data-position': 'left', 'data-tooltip': 'Medium', className: 'mdi mdi-medium small color-Ts tooltipped' })
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: 'https://twitter.com/Rafase282', target: '_blank' },
            React.createElement('i', { 'data-position': 'left', 'data-tooltip': 'Twitter', className: 'mdi mdi-twitter small color-Ts tooltipped' })
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: 'http://www.freecodecamp.com/rafase282', target: '_blank', style: {
                fontSize: '2em'
              }, className: 'color-Ts' },
            '(',
            React.createElement('i', { 'data-position': 'left', 'data-tooltip': 'Free Code Camp', className: 'fa fa-fire fa-fw tooltipped' }),
            ')'
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a',
            { href: 'https://www.twitch.tv/rafase282', target: '_blank' },
            React.createElement('i', { 'data-position': 'left', 'data-tooltip': 'Twitch', className: 'mdi mdi-twitch small color-Ts tooltipped' })
          )
        )
      )
    )
  );
};
var FooterInfo = function FooterInfo() {
  return React.createElement(
    'div',
    { className: 'container' },
    React.createElement(
      'div',
      { className: 'row' },
      React.createElement(
        'div',
        { className: 'col l6 s12' },
        React.createElement(
          'h5',
          { className: 'color-Ts' },
          'About the app'
        ),
        React.createElement(
          'p',
          { className: 'color-Ts-light' },
          'The purpose of the app is to track your favorite streamers so you can see when they are online along with some basic statistics like the number of current views, followers, link to channels and preview of the current stream.',
          React.createElement('br', null),
          'If the user if offline or the account has been closed, it will let you know. You are able to add and remove accounts to keep track of.'
        )
      ),
      React.createElement(FooterInfoButtons, null)
    )
  );
};

ReactDOM.render(React.createElement(TwitchApp, null), document.querySelector('#root'));

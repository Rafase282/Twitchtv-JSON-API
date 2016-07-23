'use strict';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return call && (typeof call === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var App = function(_React$Component) {
  _inherits(App, _React$Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

    _this.state = {
      streamers: ['freecodecamp', 'storbeck', 'terakilobyte', 'habathcx', 'RobotCaleb', 'thomasballinger', 'noobs2ninjas', 'beohoff', 'MedryBW', 'brunofin', 'comster404', 'quill18', 'rafase282', 'darkness_429', 'kairi78_officiel', 'rafase282s', 'esl_sc2'],
      filteredStreamersPayloads: [],
      allStreamersPayloads: []
    };
    return _this;
  }

  App.prototype.componentWillMount = function componentWillMount() {
    var accList = JSON.parse(localStorage.getItem('Rafase282_TwitchApp'));
    if (accList) {
      this.setState({
        streamers: accList
      });
    }
  };

  App.prototype.componentDidMount = function componentDidMount() {
    var _this2 = this;

    this.state.streamers.forEach(function(streamer) {
      _this2.getStreamerFullData(streamer);
    });
  };

  App.prototype.componentDidUpdate = function componentDidUpdate(prevProps, nextProps) {
    localStorage.setItem('Rafase282_TwitchApp', JSON.stringify(this.state.streamers));
  };

  App.prototype.getUserData = function getUserData(streamer) {
    return axios.get('https://api.twitch.tv/kraken/users/' + streamer).catch(function(error) {
      if (error.response) {
        return error.response;
      }
    });
  };

  App.prototype.getStreamData = function getStreamData(streamer) {
    return axios.get('https://api.twitch.tv/kraken/streams/' + streamer).catch(function(error) {
      if (error.response) {
        return error.response;
      }
    });
  };

  App.prototype.constructPayloadForStreamer = function constructPayloadForStreamer(data) {
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

    function setOffline(msg) {
      viewers = msg;
      game = msg;
      followers = msg;
      fps = msg;
    };
    switch (streamData.status) {
      case 404:
        status = streamData.message;
        setOffline(streamData.message);
        break;
      case 422:
        status = 'Account Closed!';
        setOffline(streamData.message);
        break;
    }
    user = userData.display_name || streamData.message.split("'")[1];
    logo = userData.logo ? userData.logo : 'https://s-media-cache-ak0.pinimg.com/236x/1b/d0/eb/1bd0eb3468a132c2f8d02a56435ebd1e.jpg';
    bio = userData.bio ? userData.bio : 'No Bio available.';
    if (streamData.stream) {
      status = streamData.stream.channel.status;
      url = streamData.stream.channel.url;
      viewers = numeral(streamData.stream.viewers).format('0,0');
      game = streamData.stream.game;
      preview = streamData.stream.preview.large;
      followers = numeral(streamData.stream.channel.followers).format('0,0');
      fps = numeral(streamData.stream.average_fps).format('0.00');
    } else {
      status = 'Offline!';
      setOffline('Only Available when online.');
    }
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
      fps: fps
    };
  };

  App.prototype.getStreamerFullData = function getStreamerFullData(streamer) {
    var _this3 = this;

    return axios.all([this.getStreamData(streamer), this.getUserData(streamer)]).then(axios.spread(function(stream, user) {
      return {
        streamData: stream.data,
        userData: user.data
      };
    })).then(function(data) {
      return _this3.constructPayloadForStreamer(data);
    }).then(function(payload) {
      _this3.state.allStreamersPayloads.push(payload);
      _this3.state.filteredStreamersPayloads.push(payload);
      _this3.forceUpdate();
    });
  };

  App.prototype.filterStreamers = function filterStreamers(event) {
    var updated = this.state.streamers.filter(function(item) {
      return item.toLowerCase().search(event.target.value.toLowerCase()) !== -1;
    }).map(function(item) {
      return item.toLowerCase();
    });

    var updatedPayloadsList = this.state.allStreamersPayloads.filter(function(payload) {
      return updated.indexOf(payload.user.toLowerCase()) !== -1;
    });

    this.setState({
      filteredStreamersPayloads: updatedPayloadsList
    });
  };

  App.prototype.render = function render() {
    return React.createElement(
      'section', {
        className: 'container-fluid'
      },
      React.createElement(Header, null),
      React.createElement(
        'main', {
          className: 'page-content container'
        },
        React.createElement(
          'div', {
            className: 'row'
          },
          React.createElement(
            'div', {
              className: 'col s12'
            },
            React.createElement(
              'div', {
                className: 'card-panel color-Bp-light'
              },
              React.createElement(SearchBar, {
                filterStreamers: this.filterStreamers.bind(this)
              }),
              React.createElement(FilteredList, {
                filteredStreamersPayloads: this.state.filteredStreamersPayloads
              })
            )
          )
        ),
        React.createElement(Menu, null)
      ),
      React.createElement(Footer, null)
    );
  };

  return App;
}(React.Component);

var FilteredList = function FilteredList(props) {
  return React.createElement(
    'ul', {
      className: 'collection collapsible popout',
      'data-collapsible': 'accordion'
    },
    props.filteredStreamersPayloads.map(function(payload, i) {
      return React.createElement(UserCard, {
        key: i,
        payload: payload
      });
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
        'a', {
          href: url,
          target: '_blank',
          className: 'secondary-content'
        },
        React.createElement(
          'i', {
            className: 'material-icons'
          },
          'web'
        )
      );
    }
  };
  return React.createElement(
    'li', {
      className: 'collection-item avatar color-Bsd color-Tp'
    },
    React.createElement(
      'div', {
        className: 'collapsible-header'
      },
      React.createElement(
        'span', {
          className: 'title'
        },
        React.createElement('img', {
          src: logo,
          alt: user,
          className: 'circle'
        }),
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
      'div', {
        className: 'collapsible-body'
      },
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
      React.createElement('img', {
        src: preview,
        className: 'responsive-img'
      })
    ),
    showLink()
  );
};
var Menu = function Menu() {
  return React.createElement(
    'div', {
      className: 'fixed-action-btn horizontal click-to-toggle',
      style: {
        bottom: 45,
        right: 24
      }
    },
    React.createElement(
      'a', {
        className: 'btn-floating btn-large red'
      },
      React.createElement(
        'i', {
          className: 'material-icons'
        },
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
          'a', {
            className: 'btn-floating red'
          },
          React.createElement(
            'i', {
              className: 'material-icons'
            },
            'insert_chart'
          )
        )
      ),
      React.createElement(
        'li',
        null,
        React.createElement(
          'a', {
            className: 'btn-floating yellow darken-1'
          },
          React.createElement(
            'i', {
              className: 'material-icons'
            },
            'format_quote'
          )
        )
      ),
      React.createElement(
        'li',
        null,
        React.createElement(
          'a', {
            className: 'btn-floating green'
          },
          React.createElement(
            'i', {
              className: 'material-icons'
            },
            'publish'
          )
        )
      ),
      React.createElement(
        'li',
        null,
        React.createElement(
          'a', {
            className: 'btn-floating blue'
          },
          React.createElement(
            'i', {
              className: 'material-icons'
            },
            'attach_file'
          )
        )
      )
    )
  );
};
var SearchBar = function SearchBar(props) {
  return React.createElement(
    'div', {
      className: 'row'
    },
    React.createElement(
      'form', {
        className: 'col s12',
        action: 'action'
      },
      React.createElement(
        'div', {
          className: 'input-field col s12'
        },
        React.createElement(
          'i', {
            className: 'material-icons prefix color-Ts'
          },
          'search'
        ),
        React.createElement('input', {
          onChange: props.filterStreamers,
          className: 'color-Ts',
          id: 'search',
          type: 'text',
          name: 'search',
          placeholder: 'Search for streamers'
        })
      )
    )
  );
};
var Header = function Header() {
  return React.createElement(
    'header', {
      className: 'page-header center-align'
    },
    React.createElement(
      'nav',
      null,
      React.createElement(
        'div', {
          className: 'nav-wrapper color-Bp'
        },
        React.createElement(
          'a', {
            className: 'brand-logo center color-Ts'
          },
          'Twitch Status'
        )
      )
    )
  );
};
var Footer = function Footer() {
  return React.createElement(
    'footer', {
      className: 'page-footer center-align color-Bp'
    },
    React.createElement(FooterInfo, null),
    React.createElement(FooterCopyright, null)
  );
};
var FooterCopyright = function FooterCopyright() {
  return React.createElement(
    'div', {
      className: 'footer-copyright'
    },
    React.createElement(
      'div', {
        className: 'container center-align'
      },
      'Copyright ©  ',
      React.createElement(
        'a', {
          className: 'color-Ts',
          href: 'http://rafase282.github.io/'
        },
        'Rafael J. Rodriguez'
      ),
      '  2016. All Rights Reserved'
    )
  );
};
var FooterInfoButtons = function FooterInfoButtons() {
  return React.createElement(
    'div', {
      className: 'col l4 offset-l2 s12'
    },
    React.createElement(
      'h5', {
        className: 'color-Ts'
      },
      'Follow Me!'
    ),
    React.createElement(
      'div', {
        className: 'col s6'
      },
      React.createElement(
        'ul',
        null,
        React.createElement(
          'li',
          null,
          React.createElement(
            'a', {
              href: 'https://github.com/Rafase282',
              target: '_blank'
            },
            React.createElement('span', {
              'data-position': 'left',
              'data-tooltip': 'GitHub',
              className: 'devicons devicons-github_badge color-Ts tooltipped'
            })
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a', {
              href: 'https://www.linkedin.com/in/rafase282',
              target: '_blank'
            },
            React.createElement('i', {
              'data-position': 'left',
              'data-tooltip': 'LinkedIn',
              className: 'mdi mdi-linkedin-box small color-Ts tooltipped'
            })
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a', {
              href: 'http://codepen.io/Rafase282',
              target: '_blank'
            },
            React.createElement('span', {
              'data-position': 'left',
              'data-tooltip': 'Codepen',
              className: 'devicons devicons-codepen color-Ts tooltipped'
            })
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a', {
              href: 'https://www.youtube.com/c/rafaelrodriguez282',
              target: '_blank'
            },
            React.createElement('i', {
              'data-position': 'left',
              'data-tooltip': 'YouTube',
              className: 'mdi mdi-youtube-play small color-Ts tooltipped'
            })
          )
        )
      )
    ),
    React.createElement(
      'div', {
        className: 'col s6'
      },
      React.createElement(
        'ul',
        null,
        React.createElement(
          'li',
          null,
          React.createElement(
            'a', {
              href: 'https://medium.com/@Rafase282',
              target: '_blank'
            },
            React.createElement('i', {
              'data-position': 'left',
              'data-tooltip': 'Medium',
              className: 'mdi mdi-medium small color-Ts tooltipped'
            })
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a', {
              href: 'https://twitter.com/Rafase282',
              target: '_blank'
            },
            React.createElement('i', {
              'data-position': 'left',
              'data-tooltip': 'Twitter',
              className: 'mdi mdi-twitter small color-Ts tooltipped'
            })
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a', {
              href: 'http://www.freecodecamp.com/rafase282',
              target: '_blank',
              style: {
                fontSize: '2em'
              },
              className: 'color-Ts'
            },
            '(',
            React.createElement('i', {
              'data-position': 'left',
              'data-tooltip': 'Free Code Camp',
              className: 'fa fa-fire fa-fw tooltipped'
            }),
            ')'
          )
        ),
        React.createElement(
          'li',
          null,
          React.createElement(
            'a', {
              href: 'https://www.twitch.tv/rafase282',
              target: '_blank'
            },
            React.createElement('i', {
              'data-position': 'left',
              'data-tooltip': 'Twitch',
              className: 'mdi mdi-twitch small color-Ts tooltipped'
            })
          )
        )
      )
    )
  );
};
var FooterInfo = function FooterInfo() {
  return React.createElement(
    'div', {
      className: 'container'
    },
    React.createElement(
      'div', {
        className: 'row'
      },
      React.createElement(
        'div', {
          className: 'col l6 s12'
        },
        React.createElement(
          'h5', {
            className: 'color-Ts'
          },
          'About the app'
        ),
        React.createElement(
          'p', {
            className: 'color-Ts-light'
          },
          'The purpose of the app is to track your favorite streamers so you can see when they are online along with some basic statistics like the number of current views, followers, link to channels and preview of the current stream.',
          React.createElement('br', null),
          'If the user if offline or the account has been closed, it will let you know. You are able to add and remove accounts to keep track of.'
        )
      ),
      React.createElement(FooterInfoButtons, null)
    )
  );
};

ReactDOM.render(React.createElement(App, null), document.querySelector('#content'));

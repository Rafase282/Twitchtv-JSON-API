'use strict';

var App = React.createClass({
  displayName: 'App',

  getInitialState: function getInitialState() {
    return {
      accounts: ['freecodecamp', 'storbeck', 'terakilobyte', 'habathcx', 'RobotCaleb', 'thomasballinger', 'noobs2ninjas', 'beohoff', 'MedryBW', 'brunofin', 'comster404', 'quill18', 'rafase282', 'darkness_429', 'kairi78_officiel'],
      logoURL: 'https://s-media-cache-ak0.pinimg.com/236x/1b/d0/eb/1bd0eb3468a132c2f8d02a56435ebd1e.jpg',
      user: '',
      channel: '',
      search: '',
      streams: '',
      ingests: '',
      teams: '',
      accInfo: {}
    };
  },
  componentWillMount: function componentWillMount() {
    var accList = JSON.parse(localStorage.getItem('Rafase282_TwitchApp'));
    if (accList) {
      this.setState({
        accounts: accList
      });
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    localStorage.setItem('Rafase282_TwitchApp', JSON.stringify(this.state.accounts));
  },
  componentDidMount: function componentDidMount() {
    var _this = this;

    this.serverRequest = $.get('https://api.twitch.tv/kraken/', function(res) {
      var userObj = {};
      var userURI = res._links.user + 's/';
      var streamURI = res._links.streams + '/';
      var logo = _this.state.logoURL;
      var accounts = _this.state.accounts;
      var counter = 1;
      var counter2 = 0;
      var length = accounts.length;
      var tmp = accounts.map(getUserInfo);
      var states = _this;
      var Account = _this.makeAccountObj;

      function getUserInfo(currUser) {
        $.getJSON(userURI + currUser + '?callback=?', function(response) {
          if (response.logo === null) {
            currUser = new Account(response.display_name, logo, response.bio);
          } else {
            currUser = new Account(response.display_name, response.logo, response.bio);
          };
          userObj[currUser.name] = currUser;
          if (counter === length) {
            for (var key in userObj) {
              getStreamInfo(userObj[key]);
            }
          } else {
            counter++;
          }
        });
      };

      function getStreamInfo(currStream) {
        counter2++;
        $.getJSON(streamURI + currStream.name + '?callback=?', function(feed) {
          if (feed.status == 422) {
            currStream.status = 'Account Closed!';
            setOffline();
          } else if (feed.stream !== null && feed.stream !== undefined) {
            currStream.status = feed.stream.channel.status;
            currStream.url = feed.stream.channel.url;
            currStream.viewers = numeral(feed.stream.viewers).format('0,0');
            currStream.game = feed.stream.game;
            currStream.preview = feed.stream.preview.large;
            currStream.followers = numeral(feed.stream.channel.followers).format('0,0');
            currStream.fps = numeral(feed.stream.average_fps).format('0.00');
          } else {
            currStream.status = 'Offline!';
            setOffline();
          }
          if (counter2 === length) {
            states.setState({
              user: res._links.user,
              channel: res._links.channel,
              search: res._links.search,
              streams: res._links.streams,
              ingests: res._links.ingest,
              teams: res._links.teams,
              accInfo: userObj
            });
          }

          function setOffline() {
            currStream.viewers = 'Only Available when online.';
            currStream.game = 'Only Available when online.';
            currStream.followers = 'Only Available when online.';
            currStream.fps = 'Only Available when online.';
          }
        });
      };
    });
  },
  componentWillUnmount: function componentWillUnmount() {
    this.serverRequest.abort();
  },
  makeAccountObj: function Account(name, logo, bio, status, url, viewers, game, preview, followers, fps) {
    this.name = name;
    this.logo = logo;
    this.bio = bio;
    this.status = status;
    this.url = url;
    this.viewers = viewers;
    this.game = game;
    this.preview = preview;
    this.followers = followers;
    this.fps = fps;
  },
  setFiltered: function setFiltered(filtered) {
    this.setState({
      accounts: fitered
    });
  },
  obj2arr: function obj2arr() {
    var users = this.state.accInfo;
    var userArr = [];
    for (var key in users) {
      var user = users[key];
      userArr.push(user);
    }
    return userArr;
  },
  render: function render() {
    var accounts = this.state.accounts;
    var userArr = this.obj2arr();
    var userCards = userArr.map(function(accountData) {
      return React.createElement(UserCard, {
        users: accountData
      });
    });
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
                setFilter: this.state.setFiltered,
                accounts: accounts
              }),
              React.createElement(
                'ul', {
                  className: 'collection collapsible popout',
                  'data-collapsible': 'accordion'
                },
                userCards
              )
            )
          )
        ),
        React.createElement(Menu, null)
      ),
      React.createElement(Footer, null)
    );
  }
});
var UserCard = React.createClass({
  displayName: 'UserCard',

  showLink: function showLink() {
    var url = this.props.users.url;
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
  },
  showBio: function showBio() {
    var bio = this.props.users.bio;
    return bio !== null ? bio : 'No Bio available.';
  },
  render: function render() {
    var userObj = this.props.users;
    var classes = 'collection-item avatar color-Bsd color-Tp ' + userObj.name.toLowerCase();
    return React.createElement(
      'li', {
        className: classes
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
            src: userObj.logo,
            alt: userObj.user,
            className: 'circle'
          }),
          ' ',
          userObj.name,
          React.createElement(
            'p',
            null,
            React.createElement(
              'strong',
              null,
              'Title: '
            ),
            userObj.status
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
          this.showBio(),
          React.createElement('br', null),
          React.createElement(
            'strong',
            null,
            'Playing: '
          ),
          userObj.game,
          React.createElement('br', null),
          React.createElement(
            'strong',
            null,
            'Current Views: '
          ),
          userObj.viewers,
          React.createElement('br', null),
          React.createElement(
            'strong',
            null,
            'Followers: '
          ),
          userObj.followers,
          React.createElement('br', null),
          React.createElement(
            'strong',
            null,
            'Stream Average FPS: '
          ),
          userObj.fps
        ),
        React.createElement('img', {
          src: userObj.preview,
          alt: userObj.user,
          className: 'responsive-img'
        })
      ),
      this.showLink()
    );
  }
});
var Menu = React.createClass({
  displayName: 'Menu',

  render: function render() {
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
  }
});
var SearchBar = React.createClass({
  displayName: 'SearchBar',

  search: function search() {
    if ($('#search').val().length > 0) {
      $('.collection-item').css('display', 'none');
      this.getFiltered();
    } else {
      $('.collection-item').css('display', 'block');
    }
    $('#search').unbind('keyup');
    $('#search').keyup(this.search);
  },
  displayResults: function displayResults() {
    var reg = new RegExp($('#search').val(), 'ig');
    var accounts = this.props.accounts;
    for (var key in users) {
      var name = users[key];
      if (reg.test(name)) {
        console.log(reg, name, reg.test(name), '.' + name);
        $('.' + name).css('display', 'block');
      }
    };
  },
  getFiltered: function getFiltered() {
    var reg = new RegExp($('#search').val(), 'ig');
    var names = this.props.accounts;
    var filtered = names.filter(function(user) {
      return reg.test(user);
    });
    this.props.setFilter(filtered);
  },

  componentDidMount: function componentDidMount() {
    //$('#search').keyup(this.search);
  },
  render: function render() {
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
            onChange: this.getFiltered,
            className: 'color-Ts',
            id: 'search',
            type: 'text',
            name: 'search',
            placeholder: 'Search for an account ...'
          })
        )
      )
    );
  }
});
var Header = React.createClass({
  displayName: 'Header',
  render: function render() {
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
  }
});
var Footer = React.createClass({
  displayName: 'Footer',

  render: function render() {
    return React.createElement(
      'footer', {
        className: 'page-footer center-align color-Bp'
      },
      React.createElement(FooterInfo, null),
      React.createElement(FooterCopyright, null)
    );
  }
});
var FooterCopyright = React.createClass({
  displayName: 'FooterCopyright',

  render: function render() {
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
  }
});
var FooterInfoButtons = React.createClass({
  displayName: 'FooterInfoButtons',

  render: function render() {
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
  }
});
var FooterInfo = React.createClass({
  displayName: 'FooterInfo',

  render: function render() {
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
  }
});
ReactDOM.render(React.createElement(App, null), document.getElementById('content'));
